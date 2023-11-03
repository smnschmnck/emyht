import { queryKeys } from '@/configs/queryKeys';
import { HttpError } from '@/errors/httpError/httpError';
import { useQuery } from '@tanstack/react-query';

export const useUserData = () => {
  return useQuery({
    ...queryKeys.users.details,
    retry: (retryCount, error) => {
      if (error instanceof HttpError) {
        if (error.statusCode === 401) {
          return false;
        }
      }
      return retryCount <= 3;
    },
  });
};
