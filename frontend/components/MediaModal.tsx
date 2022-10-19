import { Modal } from './atomic/Modal';
import Image from 'next/image';
import styles from '../styles/MediaModal.module.css';

interface MediaModalProps {
  closeHandler: () => void;
  mediaType: 'video' | 'image';
  mediaSource: string;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  closeHandler,
  mediaType,
  mediaSource,
}) => {
  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={false}>
      <div className={styles.mediaWrapper}>
        {mediaType === 'image' && (
          <Image
            src={mediaSource}
            alt="image"
            layout="fill"
            objectFit="contain"
          />
        )}
        {mediaType === 'video' && (
          <video
            className={styles.videoPlayer}
            src={mediaSource}
            controls
            autoPlay
          />
        )}
      </div>
    </Modal>
  );
};
