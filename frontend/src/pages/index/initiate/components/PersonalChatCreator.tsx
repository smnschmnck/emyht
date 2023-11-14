import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/configs/queryKeys';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { toast } from 'sonner';

type PersonalChatCreatorProps = {
  selectedUsers: string[];
};

export const PersonalChatCreator: FC<PersonalChatCreatorProps> = ({
  selectedUsers,
}) => {
  const queryClient = useQueryClient();
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
      queryClient.refetchQueries({
        queryKey: queryKeys.chats.all.queryKey,
      });
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
