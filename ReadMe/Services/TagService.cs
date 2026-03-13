using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ReadMe.Models;

namespace ReadMe.Services
{
    public static class TagService
    {
        public static string baseUrl = "http://10.0.2.2:3333";
        //public static string baseUrl = "http://localhost:3333";

        private static readonly HttpClient _http = new HttpClient();

        public static async Task<List<Tag>> GetTagsAsync()
        {
            string url = $"{baseUrl}/tags";

            try
            {
                using HttpResponseMessage response = await _http.GetAsync(url);

                response.EnsureSuccessStatusCode();

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var tags = JsonSerializer.Deserialize<List<Tag>>(json, options);

                //var categories = deserializedResponse != null ? new List<Category> { deserializedResponse } : new List<Category>();

                return tags;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return new List<Tag>();
            }
        }


        public static async Task<Tag?> AddTag(string name)
        {
            string url = $"{baseUrl}/tags";
            try
            {
                // 1. Serialize manually so we can calculate exact length
                var payload = new { name = name };
                string json = JsonSerializer.Serialize(payload);

                // 2. Create StringContent explicitly
                using var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 3. Send the request
                using HttpResponseMessage response = await _http.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<Tag>(new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }

                string error = await response.Content.ReadAsStringAsync();
                Debug.WriteLine($"API Error: {error}");
                return null;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Connection Error: {ex.Message}");
                return null;
            }
        }

        public static async Task<string> AddBookToTag(int tagId, int bookId)
        {
            string url = $"{baseUrl}/books/{bookId}/tags/{tagId}";
            try
            {
                using HttpResponseMessage response = await _http.PostAsync(url, null);

                response.EnsureSuccessStatusCode();

                return response.IsSuccessStatusCode ? "Tag added successfully" : "Failed to add tag";


            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return "";
            }
        }

        public static async Task<string> RemoveBookFromTag(int tagId, int bookId)
        {
            string url = $"{baseUrl}/books/{bookId}/tags/{tagId}";
            try
            {
                using HttpResponseMessage response = await _http.DeleteAsync(url);
                response.EnsureSuccessStatusCode();
                return response.IsSuccessStatusCode ? "Tag removed successfully" : "Failed to remove tag";
            } catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return "";
            }
        }

        public static async Task<List<Tag>> GetTagsOfABook(int bookId)
        {
            string url = $"{baseUrl}/books/{bookId}/tags";
            try
            {
                using HttpResponseMessage response = await _http.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string json = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var tags = JsonSerializer.Deserialize<List<Tag>>(json, options);
                return tags;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return new List<Tag>();
            }
        }

        public static async Task<List<Book>> GetBooksPerTag(int tagId)
        {
            string url = $"{baseUrl}/tags/{tagId}/books";
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

        public static async Task<List<Book>> GetBooksPerMultipleTags(Tag[] tags)
        {
            var books = new List<Book>();

            foreach (Tag tag in tags)
            {
                var newBooks = await GetBooksPerTag(tag.Id);

                foreach (var book in newBooks) books.Add(book);
            }

            books = books.DistinctBy(b => b.Id).ToList();

            return books;
        }
    }
}
