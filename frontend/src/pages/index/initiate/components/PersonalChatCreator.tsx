import { Button } from '@/components/ui/Button';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useAuthFetch } from '@/hooks/useAuthFetch';
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
  const authFetch = useAuthFetch();
  const { mutate: createChat, isPending: isCreatingChat } = useMutation({
    mutationFn: async () => {
      const res = await authFetch('/startOneOnOneChat', {
        method: 'post',
        body: JSON.stringify({
          participantUUID: selectedUsers[0],
        }),
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
    <Button
      disabled={!hasSelectedUsers || isCreatingChat}
      isLoading={isCreatingChat}
      onClick={() => {
        if (!isCreatingChat) {
          createChat();
        }
      }}
    >
      Start chat
    </Button>
  );
};
