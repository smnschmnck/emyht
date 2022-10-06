import styles from '../../styles/AtomicLink.module.css';
import Link from 'next/link';

interface LinkProps {
  href: string;
  children?: React.ReactNode;
}

export const BigLink: React.FC<LinkProps> = ({ href, children }) => {
  return (
    <Link href={href}>
      <a className={styles.bigLink}>{children}</a>
    </Link>
  );
};

export const SmallLink: React.FC<LinkProps> = ({ href, children }) => {
  return (
    <Link href={href}>
      <a className={styles.smallLink}>{children}</a>
    </Link>
  );
};
