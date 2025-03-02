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
