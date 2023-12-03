import { ChatMessage } from '@/api/messages';
import { queryKeys } from '@/configs/queryKeys';
import { formatTimestamp } from '@/utils/dateUtils';
import { useQuery } from '@tanstack/react-query';
import { useLoader } from '@tanstack/react-router';
import { FC, useEffect, useRef } from 'react';
import { MessageInput } from './components/MessageInput';
import { chatRoute } from './route';
import { ChatHeader } from './components/ChatHeader';
import { Spinner } from '@/components/ui/Spinner';

const ChatMessage: FC<{ message: ChatMessage }> = ({ message }) => {
  const { data } = useQuery(queryKeys.users.details);

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (data.uuid === message.senderID) {
    return (
      <li className="flex w-full flex-col items-end gap-1">
        <span className="w-fit rounded-2xl bg-blue-600 px-2 py-1 text-sm text-white">
          {message.textContent}
        </span>
        <span className="text-xs text-zinc-400">
          {formatTimestamp(message.timestamp)}
        </span>
      </li>
    );
  }

  return (
    <li className="flex w-full flex-col items-start gap-1">
      <div className="flex gap-2">
        <span className="text-xs font-semibold">{message.senderUsername}</span>
        <span className="text-xs text-zinc-400">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
      <span className="w-fit rounded-2xl bg-zinc-200 px-2 py-1 text-sm text-black">
        {message.textContent}
      </span>
    </li>
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
        <ul className="flex h-20 grow flex-col gap-5 overflow-y-scroll pt-4">
          {messages?.map((message) => (
            <ChatMessage key={message.messageID} message={message} />
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
