import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type Contact = {
  name: string;
  id: string;
  profilePictureUrl: string;
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

export type SentContactRequest = {
  email: string;
  date: string;
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

export type ContactRequest = {
  senderID: string;
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
