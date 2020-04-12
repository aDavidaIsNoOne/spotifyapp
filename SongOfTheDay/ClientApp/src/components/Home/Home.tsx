import React, { Component } from 'react';

import {
  TextField,
  PrimaryButton,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import '../../custom.css';
import { initializeIcons } from '@uifabric/icons';
import Playlist from '../Playlist/Playlist';
initializeIcons();

interface IAppState {
  playlistIds: string[];
  newPlaylistId: string;
  loading: boolean;
}
const initialState: IAppState = {
  playlistIds: [],
  newPlaylistId: '',
  loading: false
};
export default class Home extends Component<{}, IAppState> {
  constructor(props: any) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.setState({ loading: true }, () => {
      this._getPlaylists().then(() => {
        this.setState({ loading: false });
      });
    });
  }
  render() {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            padding: 10,
            width: 400
          }}
        >
          <TextField
            label={'Add a new playlist'}
            placeholder={'playlist id'}
            value={this.state.newPlaylistId}
            onChange={this._onNewPlaylistChanged}
            styles={{
              root: { flex: 1 },
              subComponentStyles: { label: { root: { color: 'white' } } }
            }}
          />
          <PrimaryButton
            text={'Submit'}
            onClick={this._submitPlaylist}
            styles={{
              root: { backgroundColor: '#1db954', borderColor: '#1db954' },
              rootHovered: {
                backgroundColor: '#1db954',
                borderColor: '#1db954'
              }
            }}
          />
        </div>
        {this.state.loading ? (
          <Spinner
            styles={{
              circle: {
                width: 200,
                height: 200,
                borderTopColor: '#1db954'
              }
            }}
            size={SpinnerSize.large}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {this.state.playlistIds.map((id) => {
              return <Playlist id={id} />;
            })}
          </div>
        )}
      </div>
    );
  }

  private _onNewPlaylistChanged = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    this.setState({ newPlaylistId: newValue || '' });
  };
  private _submitPlaylist = async () => {
    this.setState({ loading: true });
    await fetch(`${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playlistId: this.state.newPlaylistId })
    });
    this.setState({ newPlaylistId: '', loading: false });
    await this._getPlaylists();
  };

  private _getPlaylists = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/all`
    );
    const data: string[] = await response.json();
    this.setState({ playlistIds: data });
  };
}
