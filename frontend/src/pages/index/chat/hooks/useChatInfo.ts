import { HttpError } from '@/errors/httpError/httpError';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useQuery } from '@tanstack/react-query';

export const useChatInfo = ({ chatId }: { chatId?: string }) => {
  const authFetch = useAuthFetch();

  return useQuery({
    queryKey: ['chatInfo', chatId],
    queryFn: async () => {
      if (!chatId) {
        return undefined;
      }

      const res = await authFetch(`/chatInfo/${chatId}`);

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
      const json = (await res.json()) as {
        info: string;
        isChatBlocked: boolean;
      };

      return json;
    },
  });
};
