import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

type CurrentUser = {
  uuid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  profilePictureUrl: string;
};

export const useCurrentUser = () => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await authFetch('/user');
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as CurrentUser;
    },
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
