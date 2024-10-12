import { Spinner } from '@/components/ui/Spinner';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { FC } from 'react';

export const PendingComponent: FC = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <img className="w-36" src={emyhtLogo} alt="emyht" />
    <Spinner />
  </div>
);
