import { useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/AtomicPopupButton.module.css';

interface PopupButtonProps {
  buttonClassName?: string;
  icon?: string;
  iconAlt?: string;
  label?: string;
  children: React.ReactNode;
  showPopUp?: boolean;
}

export const PopupButton: React.FC<PopupButtonProps> = ({
  children,
  buttonClassName,
  icon,
  iconAlt,
  label,
  showPopUp,
}) => {
  const [showPopup, setShowPopup] = useState(showPopUp ?? false);
  return (
    <>
      <div>
        <button
          onClick={() => setShowPopup(!showPopup)}
          className={buttonClassName ?? styles.button}
        >
          <div className={styles.buttonContent}>
            {icon && <Image src={icon} alt={iconAlt ?? ''}></Image>}
            <span>{label}</span>
          </div>
        </button>
        {showPopup && <div className={styles.popup}>{children}</div>}
      </div>
    </>
  );
};
