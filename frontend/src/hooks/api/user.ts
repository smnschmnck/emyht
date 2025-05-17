import { getUserData, UserData } from '@/api/user';
import { HttpError } from '@/errors/httpError/httpError';
import { fetchWithDefaults } from '@/utils/fetch';
import { UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUserData = (
  options?: Omit<UseQueryOptions<UserData, HttpError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UserData, HttpError>({
    queryKey: ['user'],
    queryFn: getUserData,
    ...options,
  });
};

export const useBlockUser = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: async (userId?: string) => {
      if (userId) {
        throw new Error('Invalid user');
      }
      const body = {
        userID: userId,
      };
      const res = await fetchWithDefaults('/blockUser', {
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
