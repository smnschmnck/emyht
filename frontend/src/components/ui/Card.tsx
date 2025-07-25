import { ReactNode } from 'react';

export const Card = ({ children }: { children: ReactNode }) => (
  <div className="flex h-fit w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-6 shadow-xs lg:p-10">
    {children}
  </div>
);
