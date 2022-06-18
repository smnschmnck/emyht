import Image from 'next/image';
import styles from '../styles/DefaultLayout.module.css';
import logo from '../assets/images/emyht-logo.svg';
import Link from 'next/link';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.mainHeader}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Link href={'/'} passHref>
              <Image
                objectFit={'contain'}
                width={'100px'}
                src={logo}
                alt="emyht-logo"
              ></Image>
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default DefaultLayout;
