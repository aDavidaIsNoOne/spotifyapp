using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
        private static Token _token;
        private readonly SongOfTheDayContext _context;
        private readonly SpotifySettings _settings;

        private readonly ILogger<SpotifyController> _logger;

        public SpotifyController(ILogger<SpotifyController> logger, IConfiguration configuration, SongOfTheDayContext context, IOptions<SpotifySettings> settings)
        {
            _settings = settings.Value;
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
            var spotify = await GetSpotifyClient();
            var result = await spotify.GetPlaylistAsync(dto.PlaylistId);
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
           var spotify = await GetSpotifyClient();

            var result = await spotify.GetPlaylistAsync(id);
            var playlistTracks = result.Tracks.Items;

            await _AddPlaylistTracks(playlistTracks, result.Id);

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
            var spotify = await GetSpotifyClient();

            foreach (var playlistTrack in playlistTracks)
            {
                var user = await spotify.GetPublicProfileAsync(playlistTrack.AddedBy.Id);
                if (user.HasError())
                {
                    throw new Exception(user.Error.Message);
                }
                var existingPlaylistTrack =  _context.PlaylistTracks.ToListAsync().Result.Any(x => x.PlaylistId == playlistId && x.TrackId == playlistTrack.Track.Id);
                if (existingPlaylistTrack == false)
                {
                    var newPlaylistTrack = new Models.PlaylistTrack()
                    {
                        PlaylistId = playlistId
                    };

                    var existingTrack = await _context.Tracks.SingleOrDefaultAsync(x => x.Id == playlistTrack.Track.Id);
                    if (existingTrack == null)
                    {
                        newPlaylistTrack.Track = new Track()
                        {
                            Id = playlistTrack.Track.Id,
                            Artist = playlistTrack.Track.Artists.First().Name,
                            Name = playlistTrack.Track.Name,
                            AddedBy = user.DisplayName
                        };
                      
                    }
                    else
                    {
                        newPlaylistTrack.Track = existingTrack;
                    }
                    _context.PlaylistTracks.Add(newPlaylistTrack);
                }
            };
            await _context.SaveChangesAsync();
        }

        private async Task<SpotifyWebAPI> GetSpotifyClient()
        {
            var auth = new CredentialsAuth(_settings.SpotifyClientId, _settings.SpotifyClientSecret);
            if (_token == null ||_token.IsExpired())
            {
                _token = await auth.GetToken();
            }
            return new SpotifyWebAPI
            {
                AccessToken = _token.AccessToken,
                TokenType = _token.TokenType
            };
        }
    }
}
