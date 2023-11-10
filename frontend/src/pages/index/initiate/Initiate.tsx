import { FC } from 'react';
import { ContactRequests } from './ContactRequests';

const fakeUsers = [
  {
    profilePictureUrl: '',
    username: '',
  },
];

export const InitiationView: FC = () => {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll bg-slate-50 p-14">
      <div>
        <h1 className="text-xl font-semibold">Ready to connect?</h1>
        <p className="text-sm text-zinc-500">
          Start a new chat or send a contact request
        </p>
      </div>
      <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold">New chat</h2>
          <p className="text-sm text-zinc-500">
            Start a new chat or group chat with your contacts
          </p>
        </div>
      </div>
      <ContactRequests />
    </div>
  );
};
