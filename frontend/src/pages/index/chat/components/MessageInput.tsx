import { IconButton } from '@/components/ui/IconButton';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useChatMessages } from '@/hooks/api/messages';
import { fetchWithDefaults } from '@/utils/fetch';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';

const getFilePutUrl = async (file: File) => {
  const contentLength = file.size;
  const fileExtension = file.name.split('.').at(-1);

  const res = await fetchWithDefaults('/messageMediaPutURL', {
    method: 'post',
    body: JSON.stringify({ contentLength, fileExtension }),
  });

  if (!res.ok) {
    console.log(await res.text());
  }

  const json = await res.json();

  return json as { fileID: string; presignedPutURL: string };
};

export const MessageInput: FC<{
  files: File[];
  chatId: string;
  showFilePicker: boolean;
  setShowFilePicker: (showFilePicker: boolean) => void;
}> = ({ chatId, setShowFilePicker, showFilePicker, files }) => {
  const [textContent, setTextContent] = useState('');
  const { refetch: refetchChats } = useChats();
  const { refetch: refetchChatMessages } = useChatMessages(chatId);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (event: FormEvent) => {
      files.forEach(async (f) => console.log(await getFilePutUrl(f)));
      event.preventDefault();

      const message = {
        chatID: chatId,
        textContent: textContent,
        messageType: 'plaintext',
        //fileID: string
      };

      const res = await fetchWithDefaults('/message', {
        method: 'post',
        body: JSON.stringify(message),
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
      refetchChatMessages();
      refetchChats();
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
        className="w-full bg-transparent outline-hidden placeholder:text-sm placeholder:text-zinc-500"
        placeholder="Send a message"
        value={textContent}
      />
      <div>
        <button
          type="submit"
          className="h-8 w-8 rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-500"
        >
          <PaperAirplaneIcon />
        </button>
      </div>
    </form>
  );
};
