import { HttpError } from '@/errors/httpError/httpError';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UserData = {
  uuid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  emailActive: boolean;
  profilePictureUrl: string;
};

export const useUserData = (
  options?: Omit<UseQueryOptions<UserData, HttpError>, 'queryKey' | 'queryFn'>
) => {
  const authFetch = useAuthFetch();

  return useQuery<UserData, HttpError>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await authFetch('/user');
      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
      return (await res.json()) as UserData;
    },
    ...options,
  });
};

export const useBlockUser = ({ onSuccess }: { onSuccess: () => void }) => {
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (userId?: string) => {
      if (!userId) {
        throw new Error('Invalid user');
      }
      const body = {
        userID: userId,
      };
      const res = await authFetch('/blockUser', {
        method: 'post',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: () => {
      onSuccess();
    },
  });
};
