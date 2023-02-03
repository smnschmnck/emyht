import { formatTimestamp } from '../helpers/stringFormatters';
import styles from '../styles/SingleChatMessageComponent.module.css';
import playIcon from '../assets/images/playButton.svg';
import expandIcon from '../assets/images/expand.svg';
import downloadIconWhite from '../assets/images/download_white.svg';
import downloadIconBlack from '../assets/images/download_black.svg';
import Image from 'next/image';
import { useState } from 'react';
import { MediaModal } from './MediaModal';
import { useRouter } from 'next/router';

interface SingleChatMessageProps {
  senderUsername: string;
  timestamp: number;
  textContent: string;
  isPreview: boolean;
  byCurUser: boolean;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
}

export const SingleChatMessage: React.FC<SingleChatMessageProps> = ({
  timestamp,
  textContent,
  isPreview,
  senderUsername,
  byCurUser,
  messageType,
  mediaUrl,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'image' | 'video'>(
    'video'
  );
  const [mediaModalSource, setMediaModalSource] = useState('');

  const openMediaModal = (
    mediaType: 'image' | 'video',
    mediaSource: string
  ) => {
    setShowMediaModal(true);
    setMediaModalSource(mediaSource);
    setMediaModalType(mediaType);
  };

  return (
    <>
      {showMediaModal && (
        <MediaModal
          closeHandler={() => setShowMediaModal(false)}
          mediaType={mediaModalType}
          mediaSource={mediaModalSource}
        />
      )}
      <div
        className={
          byCurUser
            ? styles.ownMessageWrapper
            : styles.participantMessageWrapper
        }
      >
        {!byCurUser && (
          <div className={styles.participantMessageInfo}>
            <p className={styles.username}>{senderUsername}</p>
            <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
          </div>
        )}
        <div
          className={
            styles.contentWrapper +
            ' ' +
            (byCurUser ? styles.userContent : styles.participantContent)
          }
        >
          {messageType === 'image' && (
            <div className={styles.imageWrapper}>
              <button
                className={styles.viewMediaButton}
                onClick={() => openMediaModal('image', mediaUrl)}
              >
                <span className={styles.viewMediaImageWrapper}>
                  <Image src={expandIcon} alt="View" layout="fill"></Image>
                </span>
              </button>
              <Image
                src={mediaUrl}
                alt="image"
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          {messageType === 'video' && (
            <div className={styles.videoWrapper}>
              <button
                className={styles.viewMediaButton}
                onClick={() => openMediaModal('video', mediaUrl)}
              >
                <span className={styles.viewMediaImageWrapper}>
                  <Image src={playIcon} alt="Play" layout="fill"></Image>
                </span>
              </button>
              <video
                className={styles.videoPlayer}
                src={mediaUrl + '#t=0.001'}
                playsInline
              />
            </div>
          )}
          {messageType === 'audio' && (
            <audio
              src={mediaUrl}
              className={styles.audioPlayer}
              controls
            ></audio>
          )}
          {messageType === 'data' && (
            <a href={mediaUrl} download className={styles.downloadButton}>
              {/* TODO: Show real filename */}
              <h3 className={styles.fileName}>{'User File'}</h3>
              <div className={styles.downloadImageWrapper}>
                <Image
                  src={byCurUser ? downloadIconBlack : downloadIconWhite}
                  alt="Download"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </a>
          )}
          {textContent && (
            <p
              className={styles.textContent}
              id={isPreview ? styles.preview : ''}
            >
              {textContent}
            </p>
          )}
        </div>
        {byCurUser && (
          <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
        )}
      </div>
    </>
  );
};
