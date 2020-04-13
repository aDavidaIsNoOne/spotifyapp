import React, { Component } from 'react';

import {
  TextField,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Stack
} from '@fluentui/react';
import { initializeIcons } from '@uifabric/icons';
import Playlist from '../Playlist/Playlist';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../../overrides.css';

import { Carousel } from 'react-responsive-carousel';
initializeIcons();

interface IAppState {
  playlistIds: string[];
  playlistUrl: string;
  loading: boolean;
}
const initialState: IAppState = {
  playlistIds: [],
  playlistUrl: '',
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
        <Stack
          horizontal
          verticalAlign={'end'}
          styles={{
            root: {
              maxWidth: '500px',
              padding: '10px 20px 10px 20px'
            }
          }}
        >
          <TextField
            label={'Add a new playlist'}
            placeholder={'playlist url'}
            value={this.state.playlistUrl}
            onChange={this._onNewPlaylistChanged}
            styles={{
              field: { color: 'white' },
              fieldGroup: {
                backgroundColor: 'transparent'
              },
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
        </Stack>
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
          <Carousel
            showIndicators={false}
            infiniteLoop
            showArrows={false}
            showThumbs={false}
            swipeScrollTolerance={80}
          >
            {this.state.playlistIds.map((id) => {
              return <Playlist key={id} id={id} />;
            })}
          </Carousel>
        )}
      </div>
    );
  }

  private _onNewPlaylistChanged = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    this.setState({ playlistUrl: newValue || '' });
  };

  private _submitPlaylist = async () => {
    if (this.state.playlistUrl) {
      this.setState({ loading: true });
      let playlistId = this.state.playlistUrl.split('/').pop();
      if (playlistId && playlistId.indexOf('?') > -1) {
        playlistId = playlistId.split('?')[0];
      }
      await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ playlistId: playlistId })
        }
      );
      this.setState({ playlistUrl: '', loading: false });
      await this._getPlaylists();
    }
  };

  private _getPlaylists = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/spotify/playlist/all`
    );
    const data: string[] = await response.json();
    this.setState({ playlistIds: data });
  };
}
