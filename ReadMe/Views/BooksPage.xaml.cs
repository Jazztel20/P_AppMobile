using ReadMe.Models;
using ReadMe.Services;
using System.Collections.ObjectModel;
using System.Diagnostics;

namespace ReadMe.Views;

public partial class BooksPage : ContentPage
{
    public ObservableCollection<Book> Books { get; set; } = new();
    public ObservableCollection<Tag> Tags { get; set; } = new();

    private bool _isSortedNew = true;
    private bool _isCategoriesVisible = false;
    private int _page = 1;
    private Book? _selectedBookForTag;

    // Pagination
    public bool CanGoPrevious => _page > 1;

    public BooksPage()
    {
        InitializeComponent();
        BindingContext = this;
        BooksCollectionView.ItemsSource = Books;
        TagCollectionView.ItemsSource = Tags;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        _isCategoriesVisible = false;
        CategoriesFolder.IsVisible = false;
        TagPopupOverlay.IsVisible = false;

        var tags = await TagService.GetTagsAsync();
        Tags.Clear();
        foreach (var tag in tags)
        {
            tag.IsSelected = false;
            Tags.Add(tag);
        }

        await LoadBooks(_page);
        RefreshActiveTagChips();
    }

    // ─── Load & display ────────────────────────────────────────────────────────

    private async Task LoadBooks(int page)
    {
        var newBooks = await BookService.GetBooksAsync(page);
        UpdateBooksList(newBooks);
        PageLabel.Text = page.ToString();
    }

    private void UpdateBooksList(IEnumerable<Book> newBooks)
    {
        var sorted = _isSortedNew
            ? newBooks.OrderByDescending(b => b.CreatedAt).ToList()
            : newBooks.OrderBy(b => b.CreatedAt).ToList();

        Books.Clear();
        foreach (var book in sorted)
            Books.Add(book);
    }

    // ─── Search ────────────────────────────────────────────────────────────────

    private async void OnSearchTextChanged(object sender, TextChangedEventArgs e)
    {
        var query = e.NewTextValue?.Trim();
        if (string.IsNullOrEmpty(query))
        {
            await LoadBooks(_page);
            return;
        }

        var all = await BookService.GetBooksAsync(1);
        var filtered = all.Where(b => b.Title.Contains(query, StringComparison.OrdinalIgnoreCase));
        UpdateBooksList(filtered);
    }

    // ─── Filter panel (tags) ───────────────────────────────────────────────────

    private void ToggleCategories(object sender, EventArgs e)
    {
        _isCategoriesVisible = !_isCategoriesVisible;
        CategoriesFolder.IsVisible = _isCategoriesVisible;
    }

    private async void OnFilterSelectionChanged(object sender, CheckedChangedEventArgs e)
    {
        await ApplyTagFiltersAsync();
        RefreshActiveTagChips();
    }

    private async Task ApplyTagFiltersAsync()
    {
        var selectedTags = Tags.Where(t => t.IsSelected).ToArray();

        if (selectedTags.Length == 0)
        {
            await LoadBooks(_page);
            return;
        }

        var filtered = await TagService.GetBooksPerMultipleTags(selectedTags);
        UpdateBooksList(filtered);
    }

    // ─── Active tag chips ─────────────────────────────────────────────────────

    private void RefreshActiveTagChips()
    {
        ActiveTagsLayout.Children.Clear();
        foreach (var tag in Tags.Where(t => t.IsSelected))
        {
            var chip = new Border
            {
                BackgroundColor = Color.FromArgb("#5BAACC"),
                StrokeShape = new Microsoft.Maui.Controls.Shapes.RoundRectangle { CornerRadius = 14 },
                Padding = new Thickness(10, 4),
            };
            var lbl = new Label
            {
                Text = $"{tag.Name} ✕",
                TextColor = Colors.White,
                FontSize = 12,
                VerticalOptions = LayoutOptions.Center
            };
            var tap = new TapGestureRecognizer();
            tap.Tapped += (s, e) =>
            {
                tag.IsSelected = false;
                RefreshActiveTagChips();
                _ = ApplyTagFiltersAsync();
            };
            chip.GestureRecognizers.Add(tap);
            chip.Content = lbl;
            ActiveTagsLayout.Children.Add(chip);
        }
    }

    // ─── Book selection → navigate to BookInfoPage ────────────────────────────

    private async void OnBookSelected(object sender, SelectionChangedEventArgs e)
    {
        var collection = (CollectionView)sender;
        if (collection.SelectedItem is Book book)
        {
            var navParams = new Dictionary<string, object> { { "book", book } };
            await Shell.Current.GoToAsync("BookInfoPage", navParams);
            collection.SelectedItem = null;
        }
    }

    // ─── Tag icon → open popup ────────────────────────────────────────────────

    private void OnTagIconClicked(object sender, EventArgs e)
    {
        // Opens popup for first book or last selected — you can wire this
        // to a specific book later; for now opens general create-tag popup.
        _selectedBookForTag = Books.FirstOrDefault();
        TagPopupOverlay.IsVisible = true;
        TagNameEntry.Text = string.Empty;
        TagDescriptionEntry.Text = string.Empty;
    }

    private void OnCloseTagPopup(object sender, EventArgs e)
    {
        TagPopupOverlay.IsVisible = false;
    }

    private async void OnConfirmTag(object sender, EventArgs e)
    {
        var name = TagNameEntry.Text?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            await DisplayAlert("Erreur", "Le nom du tag est obligatoire.", "OK");
            return;
        }

        var newTag = await TagService.AddTag(name);

        if (newTag != null)
        {
            // Attach to selected book if available
            if (_selectedBookForTag != null)
                await TagService.AddBookToTag(newTag.Id, _selectedBookForTag.Id);

            Tags.Add(newTag);
            TagPopupOverlay.IsVisible = false;
            await DisplayAlert("Succès", $"Tag \"{name}\" créé avec succès !", "OK");
        }
        else
        {
            await DisplayAlert("Erreur", "Impossible de créer le tag.", "OK");
        }
    }

    // ─── Pagination ───────────────────────────────────────────────────────────

    private async void OnNextPage(object sender, EventArgs e)
    {
        _page++;
        await LoadBooks(_page);
        OnPropertyChanged(nameof(CanGoPrevious));
    }

    private async void OnPreviousPage(object sender, EventArgs e)
    {
        if (_page > 1)
        {
            _page--;
            await LoadBooks(_page);
            OnPropertyChanged(nameof(CanGoPrevious));
        }
    }
}
