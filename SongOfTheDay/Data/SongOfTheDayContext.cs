using Microsoft.EntityFrameworkCore;
using static SongOfTheDay.Data.Models;

namespace SongOfTheDay.Data
{
    public class SongOfTheDayContext : DbContext
    {
        public SongOfTheDayContext(DbContextOptions<SongOfTheDayContext> options)
        : base(options)
        {
        }

        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<PlaylistTrack> PlaylistTracks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PlaylistTrack>().HasKey(pt => new {pt.PlaylistId, pt.TrackId });

            modelBuilder.Entity<PlaylistTrack>()
                .HasOne(pt => pt.Playlist)
                .WithMany(p => p.Tracks)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<PlaylistTrack>()
                .HasOne(pt => pt.Track)
                .WithMany(t => t.Playlists)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}
