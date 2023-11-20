import { useLoader } from '@tanstack/react-router';
import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { chatRoute } from './route';
import { Avatar } from '@/components/ui/Avatar';
import { queryKeys } from '@/configs/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { toast } from 'sonner';
import { IconButton } from '@/components/ui/IconButton';
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { ButtonLink } from '@/components/ui/ButtonLink';

const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: allChats } = useQuery(queryKeys.chats.all);
  const { data: chatInfo } = useQuery(queryKeys.chats.info(chatId));

  const curChat = allChats?.find((c) => c.chatID === chatId);

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-b-zinc-100 bg-white px-8">
      <ButtonLink to="/" aria-label={'back'} className="h-8 w-8">
        <ChevronLeftIcon className="text-zinc-400" />
      </ButtonLink>
      <div className="flex items-center justify-center gap-2">
        <Avatar imgUrl={curChat?.pictureUrl} alt={curChat?.chatName} />
        <div className="flex flex-col text-sm">
          <h1 className="font-semibold">{curChat?.chatName}</h1>
          <p className="text-zinc-500">{chatInfo?.info}</p>
        </div>
      </div>
      <IconButton ariaLabel={'Chat settings'} className="h-8 w-8">
        <EllipsisHorizontalIcon className="text-zinc-400" />
      </IconButton>
    </div>
  );
};

const MessageInput: FC<{ chatId: string; refetchMessages: () => void }> = ({
  chatId,
  refetchMessages,
}) => {
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
      refetchMessages();
      queryClient.refetchQueries(queryKeys.chats.all);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <form
      onSubmit={sendMessage}
      className="flex h-12 w-full items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 transition focus-within:border-blue-500"
    >
      <input
        onChange={(e) => setTextContent(e.target.value)}
        className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-zinc-500"
        placeholder="Send a message"
        value={textContent}
      />
      <button
        type="submit"
        className="h-8 w-8 rounded-md bg-blue-600 p-1 text-white transition hover:bg-blue-500"
      >
        <PaperAirplaneIcon />
      </button>
    </form>
  );
};

export const ChatView: FC = () => {
  const { chatId } = useLoader({ from: chatRoute.id });
  const { data: messages, refetch: refetchMessages } = useQuery(
    queryKeys.messages.chat(chatId)
  );

  const lastMessage = useRef<null | HTMLLIElement>(null);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <ChatHeader chatId={chatId} />
      <div className="flex h-full w-full max-w-3xl flex-col px-6">
        <ul className="flex h-20 grow flex-col gap-2 overflow-y-scroll pt-4">
          {messages?.map((message) => (
            <li
              key={message.messageID}
              className="w-fit rounded-2xl bg-blue-600 px-2 py-1 text-sm text-white"
            >
              {message.textContent}
            </li>
          ))}
          <li className="h-0 w-0 overflow-hidden opacity-0" ref={lastMessage}>
            end of messages
          </li>
        </ul>
        <div className="flex h-24 items-center justify-center">
          <MessageInput chatId={chatId} refetchMessages={refetchMessages} />
        </div>
      </div>
    </div>
  );
};
