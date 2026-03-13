using ReadMe.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadMe.Models
{
    public class Book
    {
        public Book(int id, string title, string @abstract, int editionYear, string imagePath, int numberOfPages, string createdAt, Category category, Author author)
        {
            Id = id;
            Title = title;
            Abstract = @abstract;
            EditionYear = editionYear;
            ImagePath = imagePath;
            NumberOfPages = numberOfPages;
            CreatedAt = createdAt;
            Category = category;
            Author = author;
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Abstract { get; set; }
        public int EditionYear { get; set; }
        public string ImagePath { get; set; }
        public string? ImageUrl => ImagePath is not null ? $"{BookService.baseUrl}{ImagePath}" : null;
        public string CreatedAt { get; set; }
        public int NumberOfPages { get; set; }


        public Category Category { get; set; }
        public Author Author { get; set; }
    }
}
