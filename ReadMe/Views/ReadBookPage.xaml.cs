using ReadMe.Models;
using ReadMe.Services;
using VersOne.Epub;
using System.Text.Json;

namespace ReadMe.Views;

public partial class ReadBookPage : ContentPage, IQueryAttributable
{
    private Book? _book;
    private EpubBook _epubBook;
    private string? _epubPath;
    private List<string> _chaptersHtml;
    private Dictionary<int, int> _progressions = new();
    private const string PrefsKey = "BooksProgression";
    private int _currentIndex;

	public ReadBookPage()
	{
		InitializeComponent();
        _currentIndex = 0;
	}

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("book", out object? bookObj) && bookObj is Book book)
        {
            _book = book;
            this.Title = book.Title;
        }
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        DownloadAndLoadBook();
    }

    private async void DownloadAndLoadBook()
    {
        if (_book is null) return;

        _epubPath = await BookService.GetEpubAsync(_book.Id);

        await LoadEBook(_epubPath);

        await ShowChapter(_currentIndex);
    }

    private async Task LoadEBook(string filePath)
    {
        try
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                LoadProgressions();

                _epubBook = await EpubReader.ReadBookAsync(fs);

                _chaptersHtml = _epubBook.ReadingOrder
                              .Select(c => c.Content)
                              .ToList();

                if (_progressions.TryGetValue(_book.Id, out int savedIndex))
                {
                    _currentIndex = savedIndex;
                }
                else
                {
                    _currentIndex = 0;
                }

            }
        } catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Error", $"Failed to load eBook: {ex.Message}", "OK");
            await Shell.Current.GoToAsync("..");
        }
    }

    private async Task ShowChapter(int index)
    {
        if (_epubBook is null) return;

        if (index < 0 || index >= _chaptersHtml.Count)
        {
            await DisplayAlert("Error", "Chapter index out of range.", "OK");
            return;
        }

        string chapter = _chaptersHtml[index];

        BookWebView.Source = new HtmlWebViewSource
        {
            Html = chapter
        };

        _currentIndex = index;

        _progressions[_book.Id] = _currentIndex;

        SaveProgressions();
    }

    private void LoadProgressions()
    {
        string json = Preferences.Default.Get(PrefsKey, "{}");
        _progressions = JsonSerializer.Deserialize<Dictionary<int, int>>(json) ?? new Dictionary<int, int>();
    }

    private void SaveProgressions()
    {
        string json = JsonSerializer.Serialize(_progressions);
        Preferences.Default.Set(PrefsKey, json);
    }

    private void OnNextClicked(object sender, EventArgs e)
    {
        if (_epubBook is null) return;

        if (_currentIndex < _chaptersHtml.Count - 1)
        {
            _currentIndex++;
            ShowChapter(_currentIndex);
        } else
        {
            ShowEndScreen();
        }
    }

    private void OnPreviousClicked(object sender, EventArgs e)
    {
        if (_currentIndex >= 0)
        {
            ShowChapter(_currentIndex);

            if (_currentIndex > 0) _currentIndex--;
        }
    }

    private void ShowEndScreen()
    {
        string htmlFin = $@"
        <html>
        <head>
            <style>
                body {{ 
                    display: flex; 
                    flex-direction: column;
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh;
                    font-family: sans-serif; 
                    text-align: center;
                    background-color: #f8f9fa;
                }}
                .card {{
                    padding: 30px;
                    border-radius: 15px;
                    background: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }}
                h1 {{ color: #2c3e50; margin-bottom: 10px; }}
                p {{ color: #7f8c8d; font-size: 1.2em; }}
                .icon {{ font-size: 50px; margin-bottom: 20px; }}
            </style>
        </head>
        <body>
            <div class='card'>
                <h1>Félicitations !</h1>
                <p>Vous avez terminé la lecture de :<br><strong>{_epubBook.Title}</strong></p>
                <p>De {_epubBook.Author}</p>
            </div>
        </body>
        </html>";

        BookWebView.Source = new HtmlWebViewSource { Html = htmlFin };
    }
}