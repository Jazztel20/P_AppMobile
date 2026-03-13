using System.Collections.ObjectModel;
using ReadMe.Models;
using ReadMe.Services;

namespace ReadMe.Views;

public partial class BookInfoPage : ContentPage, IQueryAttributable
{
    private Book? _book;
    private ObservableCollection<Tag> _tags = new();
    private int _nextId;

    public BookInfoPage()
    {
        InitializeComponent();
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("book", out object? bookObj) && bookObj is Book book)
        {
            _book = book;
            BindingContext = _book;

            ReloadTags();
        }
    }

    private async void ReloadTags()
    {
        var tags = await TagService.GetTagsOfABook(_book.Id);
        _tags.Clear();
        foreach (var tag in tags) { _tags.Add(tag); }

        BindableLayout.SetItemsSource(tagFlexLayout, _tags);
        _nextId = _tags.Count > 0 ? _tags.Max(x => x.Id) : 0;
    }

    private async void ReloadAllTags()
    {
        var allAvailableTags = await TagService.GetTagsAsync();
        
        var existingTagIds = _tags.Select(t => t.Id).ToHashSet();

        foreach (var tag in allAvailableTags)
        {
            if (existingTagIds.Contains(tag.Id))
            {
                tag.IsSelected = true;
            }
            else
            {
                tag.IsSelected = false;
            }
        }

        AllTagsCollectionView.ItemsSource = allAvailableTags;
    }

    private async void OnAddTagClicked(object sender, EventArgs e)
    {
        ReloadAllTags();

        TagOverlay.IsVisible = true;
    }
    
    private void OnCloseOverlayClicked(object sender, EventArgs e)
    {
        TagOverlay.IsVisible = false;
    }

    private async void OnSaveTagsClicked(object sender, EventArgs e)
    {
        var allTags = AllTagsCollectionView.ItemsSource as IEnumerable<Tag>;

        if (allTags is null) return;

        var selectedTags = allTags.Where(t => t.IsSelected).ToList();

        foreach (Tag tag in selectedTags)
        {
            await TagService.AddBookToTag(tag.Id, _book.Id);
        }

        var unSelectedTags = allTags.Where(t => !t.IsSelected).ToList();

        foreach (Tag tag in unSelectedTags)
        {
            await TagService.RemoveBookFromTag(tag.Id, _book.Id);
        }

        ReloadTags();
        TagOverlay.IsVisible = false;
    }

    private async void OnCreateTagClicked(object sender, EventArgs e)
    {
        string result = await DisplayPromptAsync(
            "Créer un nouveau tag",
            "Entrez le nom du tag",
            "Ok",
            "Annuler",
            placeholder: "",
            maxLength: 50,
            keyboard: Keyboard.Text);

        if (result is null) return;

        if (result == "")
        {
            await DisplayAlert("Erreur", "Veullez entrer un nom", "Ok");
            return;
        }

        string name = result.Trim();

        Tag tag = await TagService.AddTag(name);

        ReloadAllTags();
    }

    public async void OnReadBookClicked(object sender, EventArgs e)
    {
        var navParam = new Dictionary<string, object> { { "book", _book } };
        await Shell.Current.GoToAsync("ReadBookPage", navParam);
    }
}