using ReadMe.Models;
using ReadMe.Services;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ReadMe.Views;

public partial class BooksPage : ContentPage
{
	public ObservableCollection<Book> Books { get; set; } = new();
    public ObservableCollection<Category> Categories { get; set; } = new();
    public ObservableCollection<Tag> Tags { get; set; } = new();
    private bool _isSortedNew = true;
    private bool _isCategoriesVisible;

    private int _page;

	public BooksPage()
	{
		InitializeComponent();
		_page = 1;

		BooksCollectionView.ItemsSource = Books;
		CategoryCollectionView.ItemsSource = Categories;
        TagCollectionView.ItemsSource = Tags;
    }

	protected override async void OnAppearing()
	{
		base.OnAppearing();
		_isCategoriesVisible = false;
        var categories = await CategoryService.GetCategoriesAsync();
        Categories.Clear();
        foreach (var category in categories)
        {
            category.IsSelected = false;
            Categories.Add(category);
        }

        var tags = await TagService.GetTagsAsync();
        Tags.Clear();
        foreach (var tag in tags)
        {
            tag.IsSelected = false;
            Tags.Add(tag);
        }

        EnableFiltersCheckBox.IsChecked = false;
        await LoadBooks(_page);
    }

    private async Task LoadBooks(int page)
	{
		var newBooks = await BookService.GetBooksAsync(page);
		UpdateBooksList(newBooks);
    }

    private void UpdateBooksList(IEnumerable<Book> newBooks)
    {
        var sortedList = _isSortedNew 
            ? newBooks.OrderBy(b => b.CreatedAt).ToList() 
            : newBooks.OrderByDescending(b => b.CreatedAt).ToList();

        Books.Clear();
        foreach (var book in sortedList)
        {
            Books.Add(book);
        }
    }

    private async void OnEnableFiltersChanged(object sender, CheckedChangedEventArgs e)
    {
        await ApplyFiltersAsync();
    }

    private async void OnFilterSelectionChanged(object sender, CheckedChangedEventArgs e)
    {
        if (EnableFiltersCheckBox.IsChecked)
        {
            await ApplyFiltersAsync();
        }
    }

    private async Task ApplyFiltersAsync()
    {
        if (!EnableFiltersCheckBox.IsChecked)
        {
            await LoadBooks(_page);
            return;
        }

        var selectedCategories = Categories.Where(c => c.IsSelected).ToArray();
        var selectedTags = Tags.Where(t => t.IsSelected).ToArray();

        List<Book> filteredBooks = new();

        if (selectedCategories.Length > 0 && selectedTags.Length > 0)
        {
            var catBooks = await BookService.GetBooksPerMultipleCategories(selectedCategories);
            var tagBooks = await TagService.GetBooksPerMultipleTags(selectedTags);
            filteredBooks = catBooks.Where(cb => tagBooks.Any(tb => tb.Id == cb.Id)).ToList();
        }
        else if (selectedCategories.Length > 0)
        {
            filteredBooks = await BookService.GetBooksPerMultipleCategories(selectedCategories);
        }
        else if (selectedTags.Length > 0)
        {
            filteredBooks = await TagService.GetBooksPerMultipleTags(selectedTags);
        }
        else
        {
            await LoadBooks(_page);
            return;
        }

        UpdateBooksList(filteredBooks);
    }

    private async void OnBookSelected(object sender, SelectionChangedEventArgs e) 
	{
		var collection = (CollectionView)sender;
		if (collection.SelectedItem is Book book)
		{
			Dictionary<string, object> navigationParameters = new Dictionary<string, object>
			{
				{"book", book },
			};
			await Shell.Current.GoToAsync($"BookInfoPage", navigationParameters);
			((CollectionView)sender).SelectedItem = null;
		}
	}

    private void ToggleCategories(object sender, EventArgs e)
    {
        _isCategoriesVisible = !_isCategoriesVisible;
        CategoriesFolder.IsVisible = _isCategoriesVisible;
        var btn = (Button)sender;

        btn.Text = _isCategoriesVisible ? "Filtres ▼" : "Filtres ▶";
    }

    private void SortBooks(object sender, EventArgs e) 
    {
        _isSortedNew = !_isSortedNew;
        sortText.Text = _isSortedNew ? "Plus récent" : "Plus ancien";

        // Re-apply sorting on the existing list
        UpdateBooksList(Books.ToList());
        Console.WriteLine("Sorted");
    }
}