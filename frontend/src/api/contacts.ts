import { env } from '@/env';
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
      const res = await fetch(`${env.VITE_BACKEND_HOST}/contacts`, {
        credentials: 'include',
      });

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
      const res = await fetch(`${env.VITE_BACKEND_HOST}/sentContactRequests`, {
        credentials: 'include',
      });

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
      const res = await fetch(
        `${env.VITE_BACKEND_HOST}/pendingContactRequests`,
        {
          credentials: 'include',
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as ContactRequest[];
    },
  });
};
