import Image from 'next/image';
import styles from '../../styles/AtomicPopupOptions.module.css';

interface PopupOptionsProps {
  children: React.ReactNode;
}

export const PopupOptions: React.FC<PopupOptionsProps> = ({ children }) => {
  return <div className={styles.popupContent}>{children}</div>;
};

interface PopupOptionProps {
  clickHandler: () => void;
  icon?: string;
  text: string;
  textColor?: string;
}

export const PopupOption: React.FC<PopupOptionProps> = ({
  clickHandler,
  icon,
  text,
  textColor,
}) => {
  return (
    <button className={styles.popupOption} onClick={clickHandler}>
      <div className={styles.popupOptionContent} style={{ color: textColor }}>
        {icon && <Image src={icon} alt="" />}
        <span className={styles.popupOptionText}>{text}</span>
      </div>
    </button>
  );
};
