import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { FC, useState } from 'react';
import { GroupChatCreator } from './GroupChatCreator';
import { UserList } from './UserList';
import { PersonalChatCreator } from './PersonalChatCreator';

type ChatModes = 'personal' | 'group';

export const ChatCreator: FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<ChatModes>('personal');

  const hasSelectedUsers = selectedUsers.length >= 1;

  const onUserChange = (selectedUsers: string[]) => {
    setChatMode(selectedUsers.length > 1 ? 'group' : 'personal');
    setSelectedUsers(selectedUsers);
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
        <div className="h-96 max-h-60 w-full">
          <UserList
            selectedUsers={selectedUsers}
            setSelectedUsers={onUserChange}
          />
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
            <GroupChatCreator selectedUsers={selectedUsers} />
          )}
          {chatMode === 'personal' && (
            <PersonalChatCreator selectedUsers={selectedUsers} />
          )}
        </div>
      </div>
    </div>
  );
};
