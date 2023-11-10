import { FC, useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { twMerge } from 'tailwind-merge';
import { CheckMarkIcon } from '@/assets/icons/CheckmarkIcon';
import { RadioGroup, RadioGroupItem } from '@/assets/icons/RadioGroup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const fakeUsers = [
  {
    uuid: 'jsnkjdnf',
    profilePictureUrl: 'default_1',
    username: 'John Doe',
  },
  {
    uuid: 'ubwetiwr',
    profilePictureUrl: 'default_4',
    username: 'John Doe',
  },
  {
    uuid: 'jdskfbskjd',
    profilePictureUrl: 'default_9',
    username: 'John Doe',
  },
  {
    uuid: 'o9b93r8b',
    profilePictureUrl: 'default_1',
    username: 'John Doe',
  },
  {
    uuid: 'udbsifbd9',
    profilePictureUrl: 'default_4',
    username: 'John Doe',
  },
  {
    uuid: 'ofsdnoin',
    profilePictureUrl: 'default_9',
    username: 'John Doe',
  },
];

const SelectedIndicator: FC<{ selected: boolean }> = ({ selected }) => (
  <div
    className={twMerge(
      'flex h-4 w-4 items-center justify-center rounded-full p-[0.2rem] text-white',
      selected ? 'bg-blue-500' : 'border border-zinc-300'
    )}
  >
    {selected && <CheckMarkIcon />}
  </div>
);

type ChatModes = 'personal' | 'group';

export const ChatCreator: FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<ChatModes>('personal');

  const hasSelectedUsers = selectedUsers.length >= 1;

  const changeUser = (uuid: string) => {
    if (selectedUsers.includes(uuid)) {
      const filteredUsers = selectedUsers.filter((u) => u !== uuid);
      setSelectedUsers(filteredUsers);
      if (filteredUsers.length <= 1) {
        setChatMode('personal');
      }
      return;
    }

    const tmpSelectedUsers = [...selectedUsers, uuid];
    if (tmpSelectedUsers.length > 1) {
      setChatMode('group');
    }
    setSelectedUsers(tmpSelectedUsers);
  };

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
              <li key={user.uuid}>
                <button
                  onClick={() => changeUser(user.uuid)}
                  aria-label={`Add ${user.username} to chat`}
                  className="flex w-full items-center justify-between border-b border-b-zinc-100 p-2 transition hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-4">
                    <Avatar imgUrl={user.profilePictureUrl} />
                    <p className="text-sm font-semibold">{user.username}</p>
                  </div>
                  <SelectedIndicator
                    selected={selectedUsers.includes(user.uuid)}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex h-full w-full flex-col">
          <div className="flex h-fit flex-col gap-2 pb-6">
            <p className="text-sm font-semibold">Chat mode</p>
            <RadioGroup<ChatModes>
              disabled={!hasSelectedUsers}
              className="flex h-fit gap-8"
              onValueChange={(s) => setChatMode(s)}
              value={chatMode}
            >
              <RadioGroupItem<ChatModes>
                value="personal"
                id={'personalChatMode'}
                label={'Personal Chat'}
                disabled={selectedUsers.length > 1}
              />
              <RadioGroupItem<ChatModes>
                value="group"
                id={'groupChatMode'}
                label={'Group Chat'}
              />
            </RadioGroup>
          </div>
          {chatMode === 'group' && (
            <div className="flex h-full w-full flex-col justify-between">
              <div className="flex w-full items-center justify-center gap-4">
                <Avatar
                  fallbackDelay={0}
                  className="h-14 min-h-[3.5rem] w-14 min-w-[3.5rem]"
                />
                <Button className="w-full" variant="secondary">
                  Change group picture
                </Button>
              </div>
              <Input placeholder="Group name" />
              <Button disabled={!hasSelectedUsers}>Create group</Button>
            </div>
          )}
          {chatMode === 'personal' && (
            <Button disabled={!hasSelectedUsers}>Start chat</Button>
          )}
        </div>
      </div>
    </div>
  );
};
