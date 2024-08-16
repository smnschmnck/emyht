import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useMutation } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';

type GroupChatCreatorProps = {
  selectedUsers: string[];
};

export const GroupChatCreator: FC<GroupChatCreatorProps> = ({
  selectedUsers,
}) => {
  const [chatName, setChatName] = useState('');
  const { refetch: refetchChats } = useChats();
  const { mutate: createChat } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      if (selectedUsers.length <= 0) {
        return;
      }

      const res = await fetch(`${env.VITE_BACKEND_HOST}/startGroupChat`, {
        method: 'post',
        body: JSON.stringify({
          participantUUIDs: selectedUsers,
          chatName: chatName,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
    },
    onSuccess: () => {
      toast.success('Chat created successfully');
      refetchChats();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const hasSelectedUsers = selectedUsers.length >= 1;

  return (
    <form
      onSubmit={createChat}
      className="flex h-full w-full flex-col justify-between"
    >
      <div className="flex w-full items-center justify-center gap-4">
        <Avatar className="h-14 min-h-[3.5rem] w-14 min-w-[3.5rem]" />
        <Button className="w-full" variant="secondary">
          Change group picture
        </Button>
      </div>
      <Input
        placeholder="Group name"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
      />
      <Button type="submit" disabled={!hasSelectedUsers}>
        Create group
      </Button>
    </form>
  );
};
