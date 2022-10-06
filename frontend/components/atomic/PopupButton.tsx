import { useEffect, useRef, useState } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);

  const [elShowPopup, setElShowPopup] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setElShowPopup(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showPopUp]);
  return (
    <>
      <div ref={ref}>
        <button
          onClick={() => setElShowPopup(!elShowPopup)}
          className={buttonClassName ?? styles.button}
        >
          <div className={styles.buttonContent}>
            {icon && (
              <div className={styles.iconWrapper}>
                <Image
                  src={icon}
                  alt={iconAlt ?? ''}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
            )}
            <span>{label}</span>
          </div>
        </button>
        {elShowPopup && (
          <div className={styles.popup} onClick={() => setElShowPopup(false)}>
            {children}
          </div>
        )}
      </div>
    </>
  );
};
