import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useChatMessages } from '@/hooks/api/messages';
import { fetchWithDefaults } from '@/utils/fetch';
import { getFileType } from '@/utils/fileType';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';

const getFilePutUrl = async (file: File) => {
  const contentLength = file.size;

  const res = await fetchWithDefaults('/messageMediaPutURL', {
    method: 'post',
    body: JSON.stringify({ contentLength, fileName: file.name }),
  });

  if (!res.ok) {
    console.log(await res.text());
  }

  const json = await res.json();

  return json as { fileID: string; presignedPutURL: string };
};

const sendMediaMessage = async ({
  file,
  chatId,
  textContent,
}: {
  file: File;
  chatId: string;
  textContent?: string;
}) => {
  const { presignedPutURL, fileID } = await getFilePutUrl(file);
  const { ok: uploadSucess } = await fetch(presignedPutURL, {
    method: 'PUT',
    body: file,
  });
  if (!uploadSucess) {
    throw new Error('Upload failed');
  }

  const fileType = getFileType(file);

  return await postMessage({
    fileId: fileID,
    chatId,
    messageType: fileType,
    textContent,
  });
};

const postMessage = async ({
  fileId,
  chatId,
  textContent,
  messageType,
}: {
  fileId?: string;
  chatId: string;
  textContent?: string;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
}) => {
  const message = {
    chatID: chatId,
    textContent,
    messageType,
    fileID: fileId,
  };

  const res = await fetchWithDefaults('/message', {
    method: 'post',
    body: JSON.stringify(message),
  });

  return res;
};

export const MessageInput: FC<{
  files: File[];
  resetFiles: () => void;
  chatId: string;
  showFilePicker: boolean;
  setShowFilePicker: (showFilePicker: boolean) => void;
}> = ({ chatId, setShowFilePicker, showFilePicker, files, resetFiles }) => {
  const [textContent, setTextContent] = useState('');
  const { refetch: refetchChats } = useChats();
  const { refetch: refetchChatMessages } = useChatMessages(chatId);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      if (files.length <= 0) {
        const res = await postMessage({
          chatId,
          textContent,
          messageType: 'plaintext',
        });

        if (!res.ok) {
          throw new HttpError({
            message: await res.text(),
            statusCode: res.status,
          });
        }

        return;
      }

      if (files.length > 0) {
        const res = await Promise.all(
          files.map((file, i) => {
            const isLastMessage = i + 1 === files.length;
            const messageText = isLastMessage ? textContent : '';
            return sendMediaMessage({ file, chatId, textContent: messageText });
          })
        );

        res.forEach(async (r) => {
          if (!r.ok) {
            throw new HttpError({
              message: await r.text(),
              statusCode: r.status,
            });
          }
        });
      }
    },
    onSuccess: () => {
      setTextContent('');
      refetchChatMessages();
      refetchChats();
      resetFiles();
      setShowFilePicker(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <form
      onSubmit={(e: FormEvent) => {
        if (!isSending) {
          sendMessage(e);
        }
      }}
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
        <button
          disabled={isSending}
          type="submit"
          className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSending && <Spinner variant="bright" size="sm" />}
          {!isSending && <PaperAirplaneIcon />}
        </button>
      </div>
    </form>
  );
};
