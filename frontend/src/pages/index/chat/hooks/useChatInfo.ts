import { HttpError } from '@/errors/httpError/httpError';
import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export const useChatInfo = ({ chatId }: { chatId: string }) => {
  return useQuery({
    queryKey: ['chatInfo', chatId],
    queryFn: async () => {
      const res = await fetchWithDefaults(`/chatInfo/${chatId}`);

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
