import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import EmailSent from '../components/EmailSent';
import styles from '../styles/NoEmailPage.module.css';

const NoEmailPage: NextPage = () => {
  const [showMainInfo, setShowMainInfo] = useState(true);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const email = 'simon.schmeinck@gmx.de';
  const sendEmail = () => {
    //TODO: Send Email
    const res = { ok: true };
    if (res.ok) {
      setShowMainInfo(false);
      setShowEmailSent(true);
    }
    console.log('TODO: SEND EMAIL');
  };
  return (
    <>
      <Head>
        <title>Verify your E-Mail</title>
      </Head>
      <DefaultLayout>
        <div className={styles.content}>
          {showMainInfo && (
            <div className={styles.main}>
              <h1>Verify your E-Mail</h1>
              <p className={styles.info}>
                We have send an E-Mail with a verification link to
                <span className={styles.emailEmphasis}> {email}</span> to verify
                that your E-Mail address really belongs to you. Please open the
                E-Mail and click on the Link.
              </p>
              <h1>✉️</h1>
              <p className={styles.info}>You did not receive an E-Mail?</p>
              <button className={styles.button} onClick={sendEmail}>
                Resend E-Mail
              </button>
              <h2>🤔</h2>
              <p className={styles.info}>
                <span className={styles.emailEmphasis}>{email}</span> does not
                look like your E-Mail?
              </p>
              <button className={styles.button}>Change E-Mail address</button>
            </div>
          )}
          {showEmailSent && <EmailSent email={email} />}
        </div>
      </DefaultLayout>
    </>
  );
};

export default NoEmailPage;
