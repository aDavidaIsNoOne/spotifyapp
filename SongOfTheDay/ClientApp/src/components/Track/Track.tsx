import React, { Fragment, useState } from 'react';
import {
  Text,
  IconButton,
  Stack,
  Spinner,
  SpinnerSize,
  rgb2hex
} from '@fluentui/react';
import { ITrack, IPlaylistTrack } from '../../Models';

export interface ITrackprops {
  playlistTrack: IPlaylistTrack;
  upvote: (trackId: string) => Promise<void>;
}

const Track = (props: ITrackprops) => {
  const [upvoted, setUpvoted] = useState(false);

  const onUpvote = async () => {
    setUpvoted(true);
    await props.upvote(props.playlistTrack.trackId);
    setUpvoted(false);
  };
  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
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
          variant="xLarge"
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
              styles={{
                rootHovered: {
                  color: '#1db954',
                  backgroundColor: 'rgb(50,50,50)'
                },
                root: { display: 'inline-block' },
                icon: { color: '#1db954' }
              }}
              iconProps={{
                iconName: 'Up',
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
      <div>
        <Text
          styles={{ root: { color: 'white', marginBottom: 10 } }}
          variant={'medium'}
        >
          {props.playlistTrack.track.addedBy} &#8226;{' '}
          {props.playlistTrack.track.artist}
        </Text>
      </div>
    </Fragment>
  );
};

export default Track;
