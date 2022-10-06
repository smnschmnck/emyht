import Image from 'next/image';
import ImageIcon from '../assets/images/imageIcon.svg';
import VideoIcon from '../assets/images/videoIcon.svg';
import AudioIcon from '../assets/images/audioIcon.svg';
import DataIcon from '../assets/images/dataIcon.svg';
import styles from '../styles/MessageTypeIcon.module.css';

interface MessageTypeIconProps {
  messageType: string;
}

export const MessageTypeIcon: React.FC<MessageTypeIconProps> = ({
  messageType,
}) => {
  return (
    <div className={styles.icon}>
      {messageType === 'image' && (
        <Image alt="image" src={ImageIcon.src} layout={'fill'} />
      )}
      {messageType === 'video' && (
        <Image alt="video" src={VideoIcon.src} layout={'fill'} />
      )}
      {messageType === 'audio' && (
        <Image alt="audio" src={AudioIcon.src} layout={'fill'} />
      )}
      {messageType === 'data' && (
        <Image alt="data" src={DataIcon.src} layout={'fill'} />
      )}
    </div>
  );
};
