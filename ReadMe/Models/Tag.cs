using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadMe.Models
{
    public class Tag
    {
        public Tag(int id, string name)
        {
            Id = id;
            Name = name;
            IsSelected = true;
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsSelected { get; set; }
    }
}
