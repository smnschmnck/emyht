import { FC } from 'react';
import { ContactRequests } from './ContactRequests';
import { ChatCreator } from './ChatCreator';

export const InitiationView: FC = () => {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll bg-slate-50 p-14">
      <div>
        <h1 className="text-xl font-semibold">Ready to connect?</h1>
        <p className="text-sm text-zinc-500">
          Start a new chat or send a contact request
        </p>
      </div>
      <ContactRequests />
      <ChatCreator />
    </div>
  );
};
