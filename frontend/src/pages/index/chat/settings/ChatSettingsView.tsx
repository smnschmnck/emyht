import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { IconLink } from '@/components/ui/IconLink';
import { UserList } from '@/components/UserList';
import { Chat, useChats } from '@/hooks/api/chats';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useGroupMembers, useMembersNotInGroup } from './hooks/useMembers';
import { chatSettingsRoute } from './route';

const Header = ({
  chatType,
  chatName,
}: {
  chatName?: string;
  chatType?: Chat['chatType'];
}) => {
  if (chatType === 'one_on_one') {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          Settings for user{' '}
          <Link to=".." className="text-blue-600 hover:underline">
            {chatName}
          </Link>
        </h1>
        <p className="text-sm text-zinc-500">
          Change settings and manage groups
        </p>
      </div>
    );
  }

  if (chatType === 'group') {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          Settings for group{' '}
          <Link to=".." className="text-blue-600 hover:underline">
            {chatName}
          </Link>
        </h1>
        <p className="text-sm text-zinc-500">
          Change settings and add or remove members
        </p>
      </div>
    );
  }
};

const GroupPropertiesSettings = () => {
  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Group Settings</h3>
        <p className="text-sm text-zinc-500">Adjust group properties </p>
      </div>
      <div className="flex flex-col gap-3">
        <FormInput label="Name" placeholder="New group name" />
        <Button>Change name</Button>
      </div>
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold">Picture</h4>
        <div className="flex w-full items-center justify-center gap-4">
          <Avatar className="h-14 min-h-14 w-14 min-w-14" />
          <Button className="w-full" variant="secondary">
            Pick new picture
          </Button>
        </div>
        <Button>Update Picture</Button>
      </div>
    </Card>
  );
};

const GroupMemberRemove = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { data: groupMembers, isLoading: isLoadingUsers } = useGroupMembers({
    chatId,
  });

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Remove members from group</h3>
        <p className="text-sm text-zinc-500">
          Select the contacts you want to remove
        </p>
      </div>
      <div className="h-72">
        <UserList
          users={groupMembers}
          isLoading={isLoadingUsers}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
      </div>
      <Button variant="primary" disabled={selectedUsers.length <= 0}>
        Remove users
      </Button>
    </Card>
  );
};

const GroupMemberAdd = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { data: usersNotInChat, isLoading: isLoadingUsers } =
    useMembersNotInGroup({ chatId });

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Add members to group</h3>
        <p className="text-sm text-zinc-500">
          Select the contacts you want to add
        </p>
      </div>
      <div className="h-72">
        <UserList
          users={usersNotInChat}
          isLoading={isLoadingUsers}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
      </div>
      <Button disabled={selectedUsers.length <= 0}>Add users</Button>
    </Card>
  );
};

const GroupSettings = () => {
  return (
    <div className="flex w-full gap-2">
      <GroupPropertiesSettings />
      <GroupMemberAdd />
      <GroupMemberRemove />
    </div>
  );
};

export const ChatSettingsView = () => {
  const { data: allChats } = useChats();
  const { chatId } = chatSettingsRoute.useParams();

  const curChat = allChats?.find((c) => c.chatID === chatId);

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex justify-between">
        <Header chatType={curChat?.chatType} chatName={curChat?.chatName} />
        <IconLink to=".." aria-label={'back'} className="h-8 w-8">
          <XMarkIcon strokeWidth={3} className="text-zinc-500" />
        </IconLink>
      </div>
      {curChat?.chatType === 'group' && <GroupSettings />}
    </div>
  );
};
