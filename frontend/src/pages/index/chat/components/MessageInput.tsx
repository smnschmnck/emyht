import { IconButton } from '@/components/ui/IconButton';
import { queryKeys } from '@/configs/queryKeys';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';

export const MessageInput: FC<{
  chatId: string;
  showFilePicker: boolean;
  setShowFilePicker: (showFilePicker: boolean) => void;
}> = ({ chatId, setShowFilePicker, showFilePicker }) => {
  const [textContent, setTextContent] = useState('');
  const queryClient = useQueryClient();

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      const message = {
        chatID: chatId,
        textContent: textContent,
        messageType: 'plaintext',
        //fileID: string
      };

      const res = await fetch(`${env.VITE_BACKEND_HOST}/message`, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
    },
    onSuccess: () => {
      setTextContent('');
      queryClient.refetchQueries(queryKeys.messages.chat(chatId));
      queryClient.refetchQueries(queryKeys.chats.all);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <form
      onSubmit={sendMessage}
      className="flex h-12 w-full items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-1.5 transition focus-within:border-blue-500"
    >
      <div>
        <IconButton
          type="button"
          ariaLabel="Add attachment"
          onClick={() => setShowFilePicker(!showFilePicker)}
        >
          <PaperClipIcon />
        </IconButton>
      </div>
      <input
        onChange={(e) => setTextContent(e.target.value)}
        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
        placeholder="Send a message"
        value={textContent}
      />
      <div>
        <button
          type="submit"
          className="h-8 w-8 rounded-md bg-blue-600 p-1 text-white transition hover:bg-blue-500"
        >
          <PaperAirplaneIcon />
        </button>
      </div>
    </form>
  );
};
