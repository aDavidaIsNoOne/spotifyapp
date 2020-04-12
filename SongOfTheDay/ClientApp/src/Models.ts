export interface IPlaylist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tracks: IPlaylistTrack[];
}

export interface IPlaylistTrack {
  playlistId: string;
  trackId: string;
  track: ITrack;
  playlist: IPlaylist;
  votes: number;
}

export interface ITrack {
  id: string;
  name: string;
  artist: string;
  addedBy: string;
  playlists: IPlaylistTrack[];
}
