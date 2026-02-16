import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useQuery } from '@tanstack/react-query';

export type Contact = {
  username: string;
  id: string;
  pictureUrl: string;
};

export const useContacts = () => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['allContacts'],
    queryFn: async () => {
      const res = await authFetch('/contacts');

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
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['contactRequests', 'sent'],
    queryFn: async () => {
      const res = await authFetch('/sentContactRequests');

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
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['contactRequests', 'incoming'],
    queryFn: async () => {
      const res = await authFetch('/pendingContactRequests');

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as ContactRequest[];
    },
  });
};
