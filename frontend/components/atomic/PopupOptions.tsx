import Image from 'next/image';
import styles from '../../styles/ChatsComponent.module.css';

interface PopupOptionsProps {
  children: React.ReactNode;
}

export const PopupOptions: React.FC<PopupOptionsProps> = ({ children }) => {
  return <div className={styles.popupContent}>{children}</div>;
};

interface PopupOptionProps {
  clickHandler: () => void;
  icon: string;
  text: string;
}

export const PopupOption: React.FC<PopupOptionProps> = ({
  clickHandler,
  icon,
  text,
}) => {
  return (
    <button className={styles.popupOption} onClick={clickHandler}>
      <div className={styles.popupOptionContent}>
        <Image src={icon} alt=""></Image>
        <span className={styles.popupOptionText}>{text}</span>
      </div>
    </button>
  );
};
