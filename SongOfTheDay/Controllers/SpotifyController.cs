using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SongOfTheDay.Data;
using SpotifyAPI.Web;
using SpotifyAPI.Web.Auth;
using SpotifyAPI.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static SongOfTheDay.Data.DTOs;
using static SongOfTheDay.Data.Models;

namespace SongOfTheDay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpotifyController : ControllerBase
    {
        private static SpotifyWebAPI _spotify;
        private static CredentialsAuth _auth;
        private readonly SongOfTheDayContext _context;


        private readonly ILogger<SpotifyController> _logger;

        public SpotifyController(ILogger<SpotifyController> logger, IConfiguration configuration, SongOfTheDayContext context)
        {
            _auth = new CredentialsAuth(configuration.GetValue<string>("SpotifyClientId"), configuration.GetValue<string>("SpotifyClientSecret"));
            Token token = _auth.GetToken().GetAwaiter().GetResult();
            _spotify = new SpotifyWebAPI
            {
                AccessToken = token.AccessToken,
                TokenType = token.TokenType
            };
            _context = context;
        }

        [HttpGet("playlist/all")]
        public async Task<List<string>> GetPlaylistIds()
        {
            var ids = await _context.Playlists.OrderByDescending(x => x.Name).Select(x => x.Id).ToListAsync();
            return ids;
        }


        [HttpGet("playlist/{id}")]
        public async Task<Playlist> GetPlaylist(string id)
        {
            var playlist = await _context.Playlists.Include(x => x.Tracks).ThenInclude(y => y.Track).SingleOrDefaultAsync(pl => pl.Id == id);

            return playlist;
        }


        [HttpPost("playlist/add")]
        public async Task AddPlaylist(AddPlaylistDto dto)
        {
            var result = await _spotify.GetPlaylistAsync(dto.PlaylistId);
            if (result.HasError())
            {
                throw new Exception(result.Error.Message);
            }

            var existingPlaylist = await _context.Playlists.AnyAsync(x => x.Id.Equals(dto.PlaylistId));

            if (existingPlaylist == false)
            {
                var newPlaylist = new Playlist()
                {
                    Id = result.Id,
                    Description = result.Description,
                    ImageUrl = result.Images.First().Url,
                    Name = result.Name
                };
                 _context.Playlists.Add(newPlaylist);
            }

            await _context.SaveChangesAsync();

            await _AddPlaylistTracks(result.Tracks.Items, result.Id);
        }

        [HttpGet("playlist/{id}/refresh")]
        public async Task<Playlist> RefreshPlaylist(string id)
        {
            var result = await _spotify.GetPlaylistAsync(id);

            await _AddPlaylistTracks(result.Tracks.Items, result.Id);

            return await GetPlaylist(id);
        }

        [HttpDelete("playlist/{id}")]
        public async Task DeletePlaylist(string id)
        {
            var playlist = await _context.Playlists.SingleOrDefaultAsync(x => x.Id == id);
            _context.Playlists.Remove(playlist);
           await _context.SaveChangesAsync();
        }

        [HttpPost("track/upvote")]
        public async Task UpvoteTrack(VoteDto dto)
        {
            var playlistTrack = await _context.PlaylistTracks.SingleOrDefaultAsync(x => x.PlaylistId == dto.PlaylistId && x.TrackId == dto.TrackId);

            playlistTrack.Votes++;
            _context.PlaylistTracks.Update(playlistTrack);
            await _context.SaveChangesAsync();
        }

        [HttpPost("track/downvote")]
        public async Task DownvoteTrack(string trackId, string playlistId)
        {
            var playlistTrack = await _context.PlaylistTracks.SingleOrDefaultAsync(x => x.PlaylistId.Equals(playlistId) && x.TrackId.Equals(trackId));

            playlistTrack.Votes--;
            _context.PlaylistTracks.Update(playlistTrack);
            await _context.SaveChangesAsync();
        }

        private async Task _AddPlaylistTracks(IEnumerable<SpotifyAPI.Web.Models.PlaylistTrack> playlistTracks, string playlistId)
        {
            var newPlaylistTracks = new List<Models.PlaylistTrack>();

            foreach (var playlistTrack in playlistTracks)
            {
                var user = await _spotify.GetPublicProfileAsync(playlistTrack.AddedBy.Id);
                if (user.HasError())
                {
                    throw new Exception(user.Error.Message);
                }
                var existingPlaylistTrack = await _context.PlaylistTracks.AnyAsync(x => x.PlaylistId == playlistId && x.TrackId == playlistTrack.Track.Id);
                if (!existingPlaylistTrack)
                {
                    var existingTrack = await _context.Tracks.SingleOrDefaultAsync(x => x.Id == playlistTrack.Track.Id);
                    if (existingTrack == null)
                    {
                        newPlaylistTracks.Add(new Models.PlaylistTrack()
                        {
                            Track = new Track()
                            {
                                Id = playlistTrack.Track.Id,
                                Artist = playlistTrack.Track.Artists.First().Name,
                                Name = playlistTrack.Track.Name,
                                AddedBy = user.DisplayName
                            },
                            PlaylistId = playlistId
                        });
                    }
                    else
                    {
                        newPlaylistTracks.Add(new Models.PlaylistTrack()
                        {
                            Track = existingTrack,
                            PlaylistId = playlistId
                        });
                    }
                }
            };
            await _context.PlaylistTracks.AddRangeAsync(newPlaylistTracks);
            await _context.SaveChangesAsync();
        }
    }
}
