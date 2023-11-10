import { FC } from 'react';

import { Avatar } from '@/components/ui/Avatar';

const fakeUsers = [
  {
    profilePictureUrl: 'default_1',
    username: 'John Doe',
  },
  {
    profilePictureUrl: 'default_4',
    username: 'John Doe',
  },
  {
    profilePictureUrl: 'default_9',
    username: 'John Doe',
  },
  {
    profilePictureUrl: 'default_1',
    username: 'John Doe',
  },
  {
    profilePictureUrl: 'default_4',
    username: 'John Doe',
  },
  {
    profilePictureUrl: 'default_9',
    username: 'John Doe',
  },
];

export const ChatCreator: FC = () => {
  return (
    <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold">New chat</h2>
        <p className="text-sm text-zinc-500">
          Start a new chat or group chat with your contacts
        </p>
      </div>
      <div className="flex gap-10">
        <div className="h-60 w-full overflow-y-scroll">
          <ul className="pr-4">
            {fakeUsers.map((user) => (
              <li className="flex w-full items-center gap-4 border-b py-2">
                <Avatar imgUrl={user.profilePictureUrl} />
                <p className="text-sm font-semibold">{user.username}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-full w-full"></div>
      </div>
    </div>
  );
};
