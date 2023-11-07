import { Outlet } from '@tanstack/react-router';
import illustration from './assets/illustration.svg';

export const AuthLayout = () => {
  return (
    <div className="flex h-full items-center">
      <div className="hidden w-full min-w-[420px] items-center justify-center md:flex">
        <img className="w-2/3" src={illustration} alt="illustration of user" />
      </div>
      <div className="flex w-full items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};
