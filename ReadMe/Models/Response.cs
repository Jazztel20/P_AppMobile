using ReadMe.Views;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadMe.Models
{
    public class Response
    {
        public Response(Meta meta, List<Book> data)
        {
            Meta = meta;
            Data = data;
        }

        public Meta Meta { get; set; }
        public List<Book> Data { get; set; }
    }
}
