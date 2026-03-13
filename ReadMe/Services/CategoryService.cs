using ReadMe.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ReadMe.Services
{
    public static class CategoryService
    {
        //public static string baseUrl = "http://localhost:3333";
        public static string baseUrl = "http://10.0.2.2:3333";

        private static readonly HttpClient _http = new HttpClient();

        public static async Task<List<Category>> GetCategoriesAsync()
        {
            string url = $"{baseUrl}/categories";

            try
            {
                using HttpResponseMessage response = await _http.GetAsync(url);

                response.EnsureSuccessStatusCode();

                string json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var categories = JsonSerializer.Deserialize<List<Category>>(json, options);

                //var categories = deserializedResponse != null ? new List<Category> { deserializedResponse } : new List<Category>();

                return categories;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return new List<Category>();
            }
        }
    }
}
