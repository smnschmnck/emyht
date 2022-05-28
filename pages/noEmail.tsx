import { NextPage } from 'next';
import Head from 'next/head';
import DefaultLayout from '../components/DefaultLayout';

const NoEmailPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Verify your E-Mail</title>
      </Head>
      <DefaultLayout>
        <div>
          <h1>Verify your E-Mail</h1>
        </div>
      </DefaultLayout>
    </>
  );
};

export default NoEmailPage;
