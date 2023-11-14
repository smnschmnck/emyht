import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FC } from 'react';

type GroupChatCreatorProps = {
  selectedUsers: string[];
};

export const GroupChatCreator: FC<GroupChatCreatorProps> = ({
  selectedUsers,
}) => {
  const hasSelectedUsers = selectedUsers.length >= 1;

  return (
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
  );
};
