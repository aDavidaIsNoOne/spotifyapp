using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SongOfTheDay.Data
{
    public class DTOs
    {
        public class AddPlaylistDto
        {
            public string PlaylistId { get; set; }
        }
        public class VoteDto
        {
            public string TrackId { get; set; }
            public string PlaylistId { get; set; }
        }
    }
}
