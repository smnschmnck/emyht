import { FC } from 'react';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import ballonIllustration from './assets/balloon_illustration.svg';
import { Link } from '@tanstack/react-router';

export const IndexPage: FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-around px-32">
      <div className="flex flex-col items-center gap-4">
        <img className="w-24" src={emyhtLogo} alt="emyht" />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome to emyht</h1>
          <p className="text-sm text-zinc-500">See what's happening</p>
        </div>
      </div>
      <img className="max-w-xs" src={ballonIllustration} alt="balloons" />
      <div className="flex w-full gap-8 font-semibold">
        <Link
          to="/initiate"
          className="flex h-16 w-full flex-col items-center justify-center gap-8 rounded-2xl border border-zinc-100 bg-white px-12 shadow-sm transition hover:bg-zinc-100"
        >
          Check incoming contact requests
        </Link>
        <Link
          to="/initiate"
          className="flex h-16 w-full flex-col items-center justify-center gap-8 rounded-2xl border border-zinc-100 bg-white px-12 shadow-sm transition hover:bg-zinc-100"
        >
          Start a new chat
        </Link>
      </div>
    </div>
  );
};
