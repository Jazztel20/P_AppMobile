using ReadMe.Models;
using ReadMe.Services;
using System.Collections.ObjectModel;
using Microsoft.Maui.Controls.Shapes;

namespace ReadMe.Views;

public partial class BooksPage : ContentPage
{
    public ObservableCollection<Book> Books { get; set; } = new();
    public ObservableCollection<Tag> Tags { get; set; } = new();

    private bool _isCategoriesVisible = false;
    private int _page = 1;
    private Book? _selectedBookForTag;

    public BooksPage()
    {
        InitializeComponent();
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

    // ── Load ───────────────────────────────────────────────────────────────────

    private async Task LoadBooks(int page)
    {
        var books = await BookService.GetBooksAsync(page);
        // Sort newest first by default
        var sorted = books.OrderByDescending(b => b.CreatedAt).ToList();
        Books.Clear();
        foreach (var b in sorted) Books.Add(b);
        PageLabel.Text = page.ToString();
    }

    // ── Search ─────────────────────────────────────────────────────────────────

    private async void OnSearchTextChanged(object sender, TextChangedEventArgs e)
    {
        var q = e.NewTextValue?.Trim() ?? "";
        if (string.IsNullOrEmpty(q))
        {
            await LoadBooks(_page);
            return;
        }
        var all = await BookService.GetBooksAsync(1);
        var filtered = all.Where(b => b.Title.Contains(q, StringComparison.OrdinalIgnoreCase));
        Books.Clear();
        foreach (var b in filtered) Books.Add(b);
    }

    // ── Filter dropdown ────────────────────────────────────────────────────────

    private void ToggleCategories(object sender, EventArgs e)
    {
        _isCategoriesVisible = !_isCategoriesVisible;
        CategoriesFolder.IsVisible = _isCategoriesVisible;
    }

    private async void OnFilterSelectionChanged(object sender, CheckedChangedEventArgs e)
    {
        await ApplyTagFiltersAsync();
        RefreshActiveTagChips();
        if (Tags.Any(t => t.IsSelected))
            ChipsScrollView.IsVisible = true;
        else
            ChipsScrollView.IsVisible = false;
    }

    private async Task ApplyTagFiltersAsync()
    {
        var selected = Tags.Where(t => t.IsSelected).ToArray();
        if (selected.Length == 0) { await LoadBooks(_page); return; }
        var filtered = await TagService.GetBooksPerMultipleTags(selected);
        Books.Clear();
        foreach (var b in filtered) Books.Add(b);
    }

    // ── Active tag chips ───────────────────────────────────────────────────────

    private void RefreshActiveTagChips()
    {
        ActiveTagsLayout.Children.Clear();
        foreach (var tag in Tags.Where(t => t.IsSelected))
        {
            var chip = new Border
            {
                BackgroundColor = Color.FromArgb("#4A9CC7"),
                StrokeShape = new RoundRectangle { CornerRadius = 14 },
                Padding = new Thickness(10, 4),
                Content = new Label
                {
                    Text = $"{tag.Name} ✕",
                    TextColor = Colors.White,
                    FontSize = 12,
                    VerticalOptions = LayoutOptions.Center
                }
            };
            var tap = new TapGestureRecognizer();
            Tag capturedTag = tag;
            tap.Tapped += async (s, e) =>
            {
                capturedTag.IsSelected = false;
                RefreshActiveTagChips();
                await ApplyTagFiltersAsync();
                ChipsScrollView.IsVisible = Tags.Any(t => t.IsSelected);
            };
            chip.GestureRecognizers.Add(tap);
            ActiveTagsLayout.Children.Add(chip);
        }
    }

    // ── Book selection ─────────────────────────────────────────────────────────

    private async void OnBookSelected(object sender, SelectionChangedEventArgs e)
    {
        var cv = (CollectionView)sender;
        if (cv.SelectedItem is Book book)
        {
            _selectedBookForTag = book;
            var nav = new Dictionary<string, object> { { "book", book } };
            await Shell.Current.GoToAsync("BookInfoPage", nav);
            cv.SelectedItem = null;
        }
    }

    // ── Tag popup ──────────────────────────────────────────────────────────────

    private void OnTagIconClicked(object sender, EventArgs e)
    {
        _selectedBookForTag = Books.FirstOrDefault();
        TagNameEntry.Text = string.Empty;
        TagDescriptionEntry.Text = string.Empty;
        TagPopupOverlay.IsVisible = true;
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
            if (_selectedBookForTag != null)
                await TagService.AddBookToTag(newTag.Id, _selectedBookForTag.Id);

            Tags.Add(newTag);
            TagPopupOverlay.IsVisible = false;
            await DisplayAlert("Succès", $"Tag \"{name}\" créé !", "OK");
        }
        else
        {
            await DisplayAlert("Erreur", "Impossible de créer le tag.", "OK");
        }
    }

    // ── Pagination ─────────────────────────────────────────────────────────────

    private async void OnNextPage(object sender, EventArgs e)
    {
        _page++;
        await LoadBooks(_page);
    }

    private async void OnPreviousPage(object sender, EventArgs e)
    {
        if (_page > 1) { _page--; await LoadBooks(_page); }
    }
}
