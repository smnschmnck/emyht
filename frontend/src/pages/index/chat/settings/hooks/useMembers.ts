import { Contact } from '@/hooks/api/contacts';
import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export const useMembersNotInGroup = ({ chatId }: { chatId: string }) => {
  return useQuery({
    queryKey: ['membersNotInChat', { chatId }],
    queryFn: async () => {
      const res = await fetchWithDefaults(`/contactsNotInChat/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as Contact[];
    },
  });
};

export const useGroupMembers = ({ chatId }: { chatId: string }) => {
  return useQuery({
    queryKey: ['groupMembers', { chatId }],
    queryFn: async () => {
      const res = await fetchWithDefaults(`/groupMembers/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as Contact[];
    },
  });
};

export const useChatsUserCanBeAddedTo = ({ uuid }: { uuid?: string }) => {
  return useQuery({
    queryKey: ['chatsUserCanBeAddedTo', { uuid }],
    queryFn: async () => {
      if (!uuid) {
        throw new Error('No UUID');
      }
      const res = await fetchWithDefaults(
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
