using SpotifyAPI.Web.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SongOfTheDay.Data
{
    public class Models
    {
        public class Playlist
        {
            [Key]
            public string Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public string ImageUrl { get; set; }
            public ICollection<PlaylistTrack> Tracks { get; set; }
        }

        public class Track
        {
            [Key]
            public string Id { get; set; }
            public string Name { get; set; }
            public string Artist { get; set; }
            public string AddedBy { get; set; }
            public ICollection<PlaylistTrack> Playlists { get; set; }

        }

        public class PlaylistTrack
        {
            public string PlaylistId { get; set; }
            public virtual Playlist Playlist { get; set; }
            public string TrackId { get; set; }
            public virtual Track Track { get; set; }
            public int Votes { get; set; }
        }

    }
}
