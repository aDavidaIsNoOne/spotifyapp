import React, { useState, useEffect, Fragment } from 'react';
import { IPlaylist } from '../../Models';
import { Text, Image, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import Track from '../Track/Track';
import Client from '../../ApiClient';
import styles from './Playlist.module.css';
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

  return (
    <Stack className={styles.container} tokens={{ childrenGap: 10 }}>
      {loading ? (
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
        <Fragment>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <Image
              styles={{ root: { alignSelf: 'center' } }}
              width={200}
              src={playlist.imageUrl}
            />
            <Text
              styles={{
                root: {
                  maxWidth: '100%',
                  color: 'white',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '10px'
                }
              }}
              variant={'xLarge'}
            >
              {playlist.name}
            </Text>
            <Text
              styles={{
                root: {
                  maxWidth: '100%',
                  color: '#b3b3b3',
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
                    <Track
                      key={x.trackId}
                      playlistTrack={x}
                      upvote={upVote}
                      vote={vote}
                    />
                  );
                })
            : null}
        </Fragment>
      )}
    </Stack>
  );
};

export default Playlist;
