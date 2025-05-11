import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type Contact = {
  username: string;
  uuid: string;
  pictureUrl: string;
};

export const useContacts = () => {
  return useQuery({
    queryKey: ['allContacts'],
    queryFn: async () => {
      const res = await fetchWithDefaults('/contacts');

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as Contact[];
    },
  });
};

type SentContactRequest = {
  email: string;
  createdAt: string;
};

export const useSentContactRequests = () => {
  return useQuery({
    queryKey: ['contactRequests', 'sent'],
    queryFn: async () => {
      const res = await fetchWithDefaults('/sentContactRequests');

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as SentContactRequest[];
    },
  });
};

type ContactRequest = {
  senderId: string;
  senderUsername: string;
  senderProfilePicture?: string;
  senderEmail: string;
};

export const useContactRequests = () => {
  return useQuery({
    queryKey: ['contactRequests', 'incoming'],
    queryFn: async () => {
      const res = await fetchWithDefaults('/pendingContactRequests');

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as ContactRequest[];
    },
  });
};
