import React, { Fragment, useState } from 'react';
import { Text, IconButton, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { IPlaylistTrack } from '../../Models';
import styles from './Track.module.css';
export interface ITrackprops {
  playlistTrack: IPlaylistTrack;
  upvote: (trackId: string) => Promise<void>;
  vote: string;
}

const Track = (props: ITrackprops) => {
  const [upvoted, setUpvoted] = useState(false);

  const onUpvote = async () => {
    setUpvoted(true);
    await props.upvote(props.playlistTrack.trackId);
    setUpvoted(false);
  };

  const icon = () => {
    if (props.vote === props.playlistTrack.trackId) {
      return 'CheckMark';
    }
    if (!props.vote) {
      return 'Up';
    }
    if (props.vote && props.vote !== props.playlistTrack.trackId) {
      return '';
    }
  };
  return (
    <Stack.Item className={styles.track}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Text
          styles={{
            root: {
              maxWidth: '400px',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'white'
            }
          }}
          variant="large"
        >
          {props.playlistTrack.track.name}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {upvoted ? (
            <Spinner
              styles={{
                root: {
                  display: 'inline-block'
                },
                circle: {
                  width: '32px',
                  height: '32px',
                  borderTopColor: '#1db954'
                }
              }}
              size={SpinnerSize.medium}
            />
          ) : (
            <IconButton
              disabled={props.vote !== ''}
              styles={{
                iconDisabled: {
                  color: '#1db954'
                },
                rootDisabled: {
                  backgroundColor: 'transparent'
                },
                rootHovered: {
                  color: '#1db954',
                  backgroundColor: 'rgb(50,50,50)'
                },
                root: { display: 'inline-block' },
                icon: { color: '#1db954' }
              }}
              iconProps={{
                iconName: icon(),
                styles: { root: { fontSize: 20, fontWeight: 'bold' } }
              }}
              onClick={onUpvote}
            />
          )}
          {/* <IconButton
          styles={{ icon: { color: 'red' } }}
          iconProps={{ iconName: 'Down' }}
          onClick={() => props.downvoteTrack(props.playlistTrack.trackId, props.playlistTrack.playlistId)}
        /> */}
          <Text
            variant={'mediumPlus'}
            styles={{ root: { color: 'white', display: 'inline-block' } }}
          >
            {props.playlistTrack.votes}
          </Text>
        </div>
      </div>
      <Text
        styles={{ root: { color: 'white', float: 'left' } }}
        variant={'medium'}
      >
        {props.playlistTrack.track.addedBy} &#8226;{' '}
        {props.playlistTrack.track.artist}
      </Text>
    </Stack.Item>
  );
};

export default Track;
