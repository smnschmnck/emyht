import { NextPage } from 'next';
import Head from 'next/head';
import DefaultLayout from '../components/DefaultLayout';

const FourOhFour: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <DefaultLayout>
        <div>
          <h1>404 - Page not found</h1>
        </div>
      </DefaultLayout>
    </>
  );
};

export default FourOhFour;
