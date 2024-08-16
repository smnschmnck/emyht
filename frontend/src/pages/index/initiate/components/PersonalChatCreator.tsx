import { Button } from '@/components/ui/Button';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { toast } from 'sonner';

type PersonalChatCreatorProps = {
  selectedUsers: string[];
};

export const PersonalChatCreator: FC<PersonalChatCreatorProps> = ({
  selectedUsers,
}) => {
  const { refetch: refetchChats } = useChats();
  const { mutate: createChat } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${env.VITE_BACKEND_HOST}/startOneOnOneChat`, {
        method: 'post',
        body: JSON.stringify({
          participantUUID: selectedUsers[0],
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
    <Button disabled={!hasSelectedUsers} onClick={() => createChat()}>
      Start chat
    </Button>
  );
};
