import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { BigLink } from '../../components/atomic/Link';
import DefaultLayout from '../../components/DefaultLayout';
import { BACKEND_HOST } from '../../helpers/globals';
import styles from '../../styles/VerifiyEmailPage.module.css';

interface ConfirmNewEmailPageProps {
  verificationSuccess: boolean;
  status: number;
}

export const getServerSideProps: GetServerSideProps<
  ConfirmNewEmailPageProps
> = async (context: GetServerSidePropsContext) => {
  try {
    const { id } = context.query;
    const verificationID = String(id);
    const body = { confirmToken: verificationID };
    const response = await fetch(BACKEND_HOST + '/confirmChangedEmail', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      props: {
        verificationSuccess: response.ok,
        status: response.status,
      },
    };
  } catch {
    return {
      props: {
        verificationSuccess: false,
        status: 503,
      },
    };
  }
};

const ConfirmNewEmailPage: NextPage<ConfirmNewEmailPageProps> = ({
  verificationSuccess,
  status,
}) => {
  return (
    <>
      <Head>
        <title>Confirm new E-Mail</title>
      </Head>
      <DefaultLayout>
        <div className={styles.content}>
          <div className={styles.main}>
            {verificationSuccess && (
              <>
                <h1>E-Mail changed successfully 🥳</h1>
                <BigLink href="/">Get back to emyht</BigLink>
              </>
            )}
            {!verificationSuccess && (
              <>
                {status === 404 && (
                  <>
                    <h1>Could not change E-Mail 😟</h1>
                    <h2>
                      Either the supplied link does not work or the E-Mail was
                      verified already
                    </h2>
                  </>
                )}
                {status !== 404 && (
                  <>
                    <h1>Error ⚠️</h1>
                    <h2>Please check back later</h2>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default ConfirmNewEmailPage;
