using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadMe.Models
{
    public class Meta
    {
        public Meta(int total, int perPage, int currentPage, int lastPage, int firstPage, string firstPageUrl, string lastPageUrl, string? nextPageUrl, string? previousPageUrl)
        {
            Total = total;
            PerPage = perPage;
            CurrentPage = currentPage;
            LastPage = lastPage;
            FirstPage = firstPage;
            FirstPageUrl = firstPageUrl;
            LastPageUrl = lastPageUrl;
            NextPageUrl = nextPageUrl;
            PreviousPageUrl = previousPageUrl;
        }

        public int Total { get; set; }
        public int PerPage { get; set; }
        public int CurrentPage { get; set; }
        public int LastPage { get; set; }
        public int FirstPage { get; set; }
        public string FirstPageUrl { get; set; }
        public string LastPageUrl { get; set; }
        public string? NextPageUrl { get; set; }
        public string? PreviousPageUrl { get; set; }
    }
}
