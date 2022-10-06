import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { SmallButton } from '../components/atomic/Button';
import ChangeEmail from '../components/ChangeEmail';
import DefaultLayout from '../components/DefaultLayout';
import EmailSent from '../components/EmailSent';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/NoEmailPage.module.css';

interface UserProps {
  email: string;
  username: string;
  isAdmin: boolean;
}

export const getServerSideProps: GetServerSideProps<UserProps | {}> = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.cookies;
  try {
    const getUserResponse = await getLoginData(cookies);
    if (getUserResponse.emailActive) {
      const res = context.res;
      res.writeHead(302, { Location: '/' });
      res.end();
      return {
        props: {},
      };
    }
    return {
      props: {
        email: getUserResponse.email,
        username: getUserResponse.username,
        isAdmin: getUserResponse.isAdmin,
      },
    };
  } catch {
    //Not logged in
    const res = context.res;
    res.writeHead(302, { Location: '/login' });
    res.end();
    return {
      props: {},
    };
  }
};

const NoEmailPage: NextPage<UserProps> = ({ email }) => {
  const [curEmail, setCurEmail] = useState(email);
  const [showMainInfo, setShowMainInfo] = useState(true);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const sendEmail = async () => {
    const res = await fetch('/api/resendVerificationEmail');
    if (res.ok) {
      showEmailSentScreen();
    } else {
      alert(await res.text());
    }
  };
  const showEmailSentScreen = () => {
    setShowMainInfo(false);
    setShowChangeEmail(false);
    setShowEmailSent(true);
  };
  const toggleShowChangeEmail = () => {
    setShowMainInfo(!showMainInfo);
    setShowChangeEmail(!showChangeEmail);
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
              <SmallButton onClick={sendEmail}>Resend E-Mail</SmallButton>
              <h2>🤔</h2>
              <p className={styles.info}>
                <span className={styles.emailEmphasis}>{email}</span> does not
                look like your E-Mail?
              </p>
              <SmallButton onClick={toggleShowChangeEmail}>
                Change E-Mail address
              </SmallButton>
            </div>
          )}
          {showEmailSent && <EmailSent email={curEmail} />}
          {showChangeEmail && (
            <ChangeEmail
              setCurEmail={setCurEmail}
              toggleShowChangeEmail={toggleShowChangeEmail}
              showEmailSentScreen={showEmailSentScreen}
            />
          )}
        </div>
      </DefaultLayout>
    </>
  );
};

export default NoEmailPage;
