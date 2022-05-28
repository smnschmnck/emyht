import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
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
  const [showMainInfo, setShowMainInfo] = useState(true);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const sendEmail = () => {
    //TODO: Send Email
    const res = { ok: true };
    if (res.ok) {
      setShowMainInfo(false);
      setShowChangeEmail(false);
      setShowEmailSent(true);
    }
    console.log('TODO: SEND EMAIL');
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
              <button className={styles.button} onClick={sendEmail}>
                Resend E-Mail
              </button>
              <h2>🤔</h2>
              <p className={styles.info}>
                <span className={styles.emailEmphasis}>{email}</span> does not
                look like your E-Mail?
              </p>
              <button className={styles.button} onClick={toggleShowChangeEmail}>
                Change E-Mail address
              </button>
            </div>
          )}
          {showEmailSent && <EmailSent email={email} />}
          {showChangeEmail && (
            <ChangeEmail
              toggleShowChangeEmail={toggleShowChangeEmail}
              sendEmail={sendEmail}
            />
          )}
        </div>
      </DefaultLayout>
    </>
  );
};

export default NoEmailPage;
