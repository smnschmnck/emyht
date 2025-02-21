import { ChatMessage as ChatMessageType } from '@/hooks/api/messages';
import { useUserData } from '@/hooks/api/user';
import { formatTimestamp } from '@/utils/dateUtils';
import { FC } from 'react';

const MessageContent = ({ message }: { message: ChatMessageType }) => (
  <span className="flex w-fit max-w-40 flex-col">
    {message.messageType === 'image' && (
      <span className="p-1">
        <img className="overflow-clip rounded-xl" src={message.mediaUrl} />
      </span>
    )}
    {!!message.textContent && (
      <span className="px-3 py-1.5 text-sm">{message.textContent}</span>
    )}
  </span>
);

export const ChatMessage: FC<{ message: ChatMessageType }> = ({ message }) => {
  const { data } = useUserData();

  if (!data) {
    return <></>;
  }

  if (data.uuid === message.senderID) {
    return (
      <li className="flex w-full flex-col items-end gap-1">
        <span className="w-fit rounded-2xl bg-blue-600 text-white">
          <MessageContent message={message} />
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
      <span className="w-fit rounded-2xl bg-zinc-100 text-black">
        <MessageContent message={message} />
      </span>
    </li>
  );
};
