import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

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
