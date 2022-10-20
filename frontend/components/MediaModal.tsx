import { Modal } from './atomic/Modal';
import Image from 'next/image';
import styles from '../styles/MediaModal.module.css';
import { SmallButton } from './atomic/Button';

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
          <div className={styles.imageWrapper}>
            <Image
              src={mediaSource}
              alt="image"
              layout="responsive"
              width={'25px'}
              height={'25px'}
              objectFit="contain"
            />
          </div>
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
