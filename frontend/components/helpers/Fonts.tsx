import { FC } from 'react';

export const Fonts: FC = () => {
  return (
    <>
      <link
        rel="preload"
        href="https://cdn.emyht.com/fonts/Inter/Inter-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="true"
      />
      <link
        rel="preload"
        href="https://cdn.emyht.com/fonts/Inter/Inter-Medium.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="true"
      />
      <link
        rel="preload"
        href="https://cdn.emyht.com/fonts/Inter/Inter-SemiBold.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="true"
      />
    </>
  );
};
