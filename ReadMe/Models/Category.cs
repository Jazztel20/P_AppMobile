using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadMe.Models
{
    public class Category
    {
        public Category(int id, string label)
        {
            Id = id;
            Label = label;
            IsSelected = true;
        }

        public int Id { get; set; }
        public string Label { get; set; }
        public bool IsSelected { get; set; }
    }
}
