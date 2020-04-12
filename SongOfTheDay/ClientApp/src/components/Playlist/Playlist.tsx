import React, { useState, useEffect } from 'react';
import { IPlaylist } from '../../Models';
import { Text, Image, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import Track from '../Track/Track';
import Client from '../../ApiClient';

export interface IPlaylistProps {
  id: string;
}

const Playlist = (props: IPlaylistProps) => {
  const [playlist, setPlaylist] = useState({} as IPlaylist);
  const [loading, setLoading] = useState(false);
  const [vote, setVote] = useState('');
  const _client = new Client();
  useEffect(() => {
    const vote = localStorage.getItem(props.id);
    if (vote) {
      setVote(vote);
    }
    setLoading(true);
    refreshPlaylist().then(() => {
      setLoading(false);
    });
  }, [props.id]);

  const getPlaylist = async () => {
    const playlist = await _client.getPlaylist(props.id);
    setPlaylist(playlist);
  };
  const refreshPlaylist = async () => {
    const playlist = await _client.refreshPlaylist(props.id);
    setPlaylist(playlist);
  };
  const upVote = async (trackId: string) => {
    await _client.upVote(trackId, props.id);
    localStorage.setItem(props.id, trackId);
    setVote(trackId);
    await getPlaylist();
  };
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 400,
          height: 400
        }}
      >
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
      </div>
    );
  } else {
    return (
      <Stack
        style={{
          padding: 20,
          maxWidth: 400
        }}
        tokens={{ childrenGap: 20 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Image width={200} src={playlist.imageUrl} />
          <Text
            styles={{
              root: {
                color: 'white',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
            variant={'xLargePlus'}
          >
            {playlist.name}
          </Text>
          <Text
            styles={{
              root: {
                color: 'white',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
            variant={'large'}
          >
            {playlist.description}
          </Text>
        </div>
        {/* <DefaultButton
          text={'Delete'}
          onClick={() => props.deletePlaylist(playlist.id)}
        /> */}
        {playlist.tracks
          ? playlist.tracks
              .sort((a, b) => b.votes - a.votes)
              .map((x) => {
                return (
                  <Stack.Item>
                    <Track playlistTrack={x} upvote={upVote} vote={vote} />
                  </Stack.Item>
                );
              })
          : null}
      </Stack>
    );
  }
};

export default Playlist;
