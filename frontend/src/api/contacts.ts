import { env } from '@/env';

export type Contact = {
  name: string;
  id: string;
  profilePictureUrl: string;
};

export const getContacts = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/contacts`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as Contact[];
};

export type SentContactRequest = {
  email: string;
  date: string;
};

export const getSentContactRequests = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/sentContactRequests`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as SentContactRequest[];
};
