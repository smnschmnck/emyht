import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { BACKEND_HOST } from '../../helpers/globals';

interface EmailVerificationPageProps {
  resText: string;
  verificationSuccess: boolean;
}

export const getServerSideProps: GetServerSideProps<
  EmailVerificationPageProps
> = async (context: GetServerSidePropsContext) => {
  const { id } = context.query;
  const verificationID = String(id);
  const body = { emailToken: verificationID };
  const response = await fetch(BACKEND_HOST + '/verifyEmail', {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  return {
    props: {
      resText: await response.text(),
      verificationSuccess: response.ok,
    },
  };
};

const EmailVerificationPage: NextPage<EmailVerificationPageProps> = ({
  verificationSuccess,
  resText,
}) => {
  return (
    <>
      <Head>
        <title>E-Mail Verification</title>
      </Head>
      <div>
        {verificationSuccess && <h1>E-Mail succesfully verified</h1>}
        {!verificationSuccess && <h1>{resText}</h1>}
      </div>
    </>
  );
};

export default EmailVerificationPage;
