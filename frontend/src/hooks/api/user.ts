import { getUserData, UserData } from '@/api/user';
import { HttpError } from '@/errors/httpError/httpError';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

export const useUserData = (
  options?: Omit<UseQueryOptions<UserData, HttpError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UserData, HttpError>({
    queryKey: ['user'],
    queryFn: getUserData,
    ...options,
  });
};
