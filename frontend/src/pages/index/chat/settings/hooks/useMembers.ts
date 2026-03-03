import { Contact } from '@/hooks/api/contacts';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useQuery } from '@tanstack/react-query';

export const useMembersNotInGroup = ({ chatId }: { chatId: string }) => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['membersNotInChat', { chatId }],
    queryFn: async () => {
      const res = await authFetch(`/contactsNotInChat/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as Contact[];
    },
  });
};

export const useGroupMembers = ({ chatId }: { chatId: string }) => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['groupMembers', { chatId }],
    queryFn: async () => {
      const res = await authFetch(`/groupMembers/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as Contact[];
    },
  });
};

export const useChatsUserCanBeAddedTo = ({ uuid }: { uuid?: string }) => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['chatsUserCanBeAddedTo', { uuid }],
    queryFn: async () => {
      if (!uuid) {
        throw new Error('No UUID');
      }
      const res = await authFetch(
        `/getGroupchatsNewUserIsNotPartOf/${uuid}`
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as {
        id: string;
        chatName: string;
        pictureUrl: string;
      }[];
    },
  });
};
