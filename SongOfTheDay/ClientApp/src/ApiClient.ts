import { IPlaylist } from './Models';

class Client {
  public deletePlaylist = async (playlistId: string) => {
    await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/${playlistId}`,
      {
        method: 'DELETE',
      }
    );
    await this.refreshPlaylist(playlistId);
  };

  public upVote = async (trackId: string, playlistId: string) => {
    await fetch(`${process.env.REACT_APP_BASE_URL}/api/spotify/track/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackId: trackId, playlistId: playlistId }),
    });
  };

  public downVote = async (trackId: string, playlistId: string) => {
    await fetch('api/spotify/track/downvote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackId: trackId, playlistId: playlistId }),
    });
  };

  public refreshPlaylist = async (playlistId: string) => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/${playlistId}/refresh`
    );
    const playlist: IPlaylist = await response.json();
    return playlist;
  };

  public getPlaylist = async (playlistId: string) => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/${playlistId}`
    );
    const playlist: IPlaylist = await response.json();
    return playlist;
  };
}
export default Client;
