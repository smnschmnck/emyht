import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRef } from 'react';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = useRef(new QueryClient());
  return (
    <QueryClientProvider client={queryClient.current}>
      <Hydrate state={pageProps.dehydratedState}>
        <Head>
          <title>emyht</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
          />
        </Head>
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
