using ReadMe.Models;
using System.Diagnostics;
using System.Text.Json;

namespace ReadMe.Services
{
    public static class BookService
    {
        //public static string baseUrl = "http://localhost:3333";
        public static string baseUrl = "http://10.0.2.2:3333";

        private static readonly HttpClient _http = new HttpClient();

        public static async Task<List<Book>> GetBooksAsync(int page)
        {
            string url = $"{baseUrl}/books?page={page}&limit=20";

            try
            {
                using HttpResponseMessage response = await _http.GetAsync(url);

                response.EnsureSuccessStatusCode();

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var deserializedResponse = JsonSerializer.Deserialize<Response>(json, options);

                var books = deserializedResponse.Data;

                return books;
            } 
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return new List<Book>();
            }
        }

        public static async Task<string> GetEpubAsync(int bookId)
        {
            var fileName = $"book_{bookId}.epub";
            var path = Path.Combine(FileSystem.AppDataDirectory, fileName);

            if (File.Exists(path))
            {
                return path;
            }

            var url = $"{baseUrl}/books/{bookId}/download";
            var bytes = await _http.GetByteArrayAsync(url);

            File.WriteAllBytes(path, bytes);

            return path;
        }

        public static async Task<List<Book>> GetBooksPerCategory(int categoryId)
        {
            string url = $"{baseUrl}/categories/{categoryId}/books";

            try
            {
                using HttpResponseMessage response = await _http.GetAsync(url);

                response.EnsureSuccessStatusCode();

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var books = JsonSerializer.Deserialize<List<Book>>(json, options);

                return books;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return new List<Book>();
            }
        }

        public static async Task<List<Book>> GetBooksPerMultipleCategories(Category[] categories)
        {
            var books = new List<Book>();

            foreach(Category category in categories)
            {
                var newBooks = await GetBooksPerCategory(category.Id);

                foreach (var book in newBooks) books.Add(book);
            }

            return books;
        }

        public static async Task<List<Book>> GetBooksPerMultipleTags(Tag[] tags)
        {
            var tasks = tags.Select(t => TagService.GetBooksPerTag(t.Id));
            var results = await Task.WhenAll(tasks);

            return results
                .Where(list => list != null)
                .SelectMany(list => list)
                .GroupBy(book => book.Id)
                .Select(group => group.First())
                .ToList();
        }
    }
}
