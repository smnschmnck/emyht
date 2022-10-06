import { NextPage } from 'next';
import Head from 'next/head';
import { BigLink } from '../components/atomic/Link';
import DefaultLayout from '../components/DefaultLayout';
import styles from '../styles/NotFoundPage.module.css';

const FourOhFour: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <DefaultLayout>
        <div className={styles.main}>
          <div className={styles.container}>
            <div className={styles.textContainer}>
              <h1 className={styles.statusCode}>404</h1>
              <h2 className={styles.description}>Page not found</h2>
            </div>
            <BigLink href={'/'}>Back to start</BigLink>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default FourOhFour;
