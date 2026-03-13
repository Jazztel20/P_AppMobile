using ReadMe.Models;
using ReadMe.Services;
using VersOne.Epub;
using System.Text.Json;

namespace ReadMe.Views;

public partial class ReadBookPage : ContentPage, IQueryAttributable
{
    private Book? _book;
    private EpubBook? _epubBook;
    private List<string> _chaptersHtml = new();
    private Dictionary<int, int> _progressions = new();
    private const string PrefsKey = "BooksProgression";
    private int _currentIndex = 0;

    public ReadBookPage()
    {
        InitializeComponent();
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("book", out object? bookObj) && bookObj is Book book)
        {
            _book = book;
        }
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        if (_book != null)
        {
            BookTitleLabel.Text = _book.Title;
            BookAuthorLabel.Text = $"{_book.Author?.FirstName} {_book.Author?.LastName}".Trim();
        }

        DownloadAndLoadBook();
    }

    private async void DownloadAndLoadBook()
    {
        if (_book is null) return;

        try
        {
            var epubPath = await BookService.GetEpubAsync(_book.Id);
            await LoadEBook(epubPath);
            await ShowChapter(_currentIndex);
        }
        catch (Exception ex)
        {
            await DisplayAlert("Erreur", $"Impossible de charger le livre : {ex.Message}", "OK");
            await Shell.Current.GoToAsync("..");
        }
    }

    private async Task LoadEBook(string filePath)
    {
        using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read);

        LoadProgressions();

        _epubBook = await EpubReader.ReadBookAsync(fs);

        _chaptersHtml = _epubBook.ReadingOrder
            .Select(c => c.Content)
            .ToList();

        _currentIndex = _progressions.TryGetValue(_book!.Id, out int saved) ? saved : 0;
    }

    private async Task ShowChapter(int index)
    {
        if (_epubBook is null || _chaptersHtml.Count == 0) return;

        index = Math.Clamp(index, 0, _chaptersHtml.Count - 1);

        BookWebView.Source = new HtmlWebViewSource { Html = _chaptersHtml[index] };

        _currentIndex = index;
        _progressions[_book!.Id] = _currentIndex;
        SaveProgressions();

        // Update button states
        previousBtn.IsEnabled = _currentIndex > 0;
        nextBtn.IsEnabled = _currentIndex < _chaptersHtml.Count - 1;
    }

    private void LoadProgressions()
    {
        var json = Preferences.Default.Get(PrefsKey, "{}");
        _progressions = JsonSerializer.Deserialize<Dictionary<int, int>>(json) ?? new();
    }

    private void SaveProgressions()
    {
        Preferences.Default.Set(PrefsKey, JsonSerializer.Serialize(_progressions));
    }

    private async void OnNextClicked(object sender, EventArgs e)
    {
        if (_epubBook is null) return;

        if (_currentIndex < _chaptersHtml.Count - 1)
            await ShowChapter(_currentIndex + 1);
        else
            ShowEndScreen();
    }

    private async void OnPreviousClicked(object sender, EventArgs e)
    {
        if (_currentIndex > 0)
            await ShowChapter(_currentIndex - 1);
    }

    private async void OnGoHomeClicked(object sender, EventArgs e)
    {
        await Shell.Current.GoToAsync("//books");
    }

    private void ShowEndScreen()
    {
        var html = $@"
        <html><head><style>
            body {{ display:flex; flex-direction:column; justify-content:center;
                   align-items:center; height:100vh; font-family:sans-serif;
                   text-align:center; background:#f8f9fa; }}
            .card {{ padding:30px; border-radius:15px; background:white;
                     box-shadow:0 4px 15px rgba(0,0,0,0.1); }}
            h1 {{ color:#2c3e50; }} p {{ color:#7f8c8d; font-size:1.1em; }}
        </style></head>
        <body><div class='card'>
            <h1>🎉 Félicitations !</h1>
            <p>Vous avez terminé :<br><strong>{_epubBook?.Title}</strong></p>
        </div></body></html>";

        BookWebView.Source = new HtmlWebViewSource { Html = html };
        nextBtn.IsEnabled = false;
    }
}
