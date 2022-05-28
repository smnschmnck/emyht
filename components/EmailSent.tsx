import { emit } from 'process';
import styles from '../styles/EmailSentComponent.module.css';

const EmailSent: React.FC<{ email: string }> = ({ email }) => {
  return (
    <div className={styles.main}>
      <h1 className={styles.heading}>E-Mail sent 🚀</h1>
      <p className={styles.info}>
        We have send an E-Mail with a verification link to
        <span className={styles.emailEmphasis}> {email}</span>
        <br />
        Please open the E-Mail and click on the link.
      </p>
    </div>
  );
};

export default EmailSent;
