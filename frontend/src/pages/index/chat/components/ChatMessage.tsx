import { ChatMessage as ChatMessageType } from '@/hooks/api/messages';
import { useUserData } from '@/hooks/api/user';
import { formatTimestamp } from '@/utils/dateUtils';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

const MessageContent = ({ message }: { message: ChatMessageType }) => (
  <span className="flex w-fit max-w-40 flex-col">
    {message.messageType === 'image' && (
      <div className="p-1">
        <a target="_blank" rel="noopener noreferrer" href={message.mediaUrl}>
          <img className="overflow-clip rounded-xl" src={message.mediaUrl} />
        </a>
      </div>
    )}
    {message.messageType === 'data' && (
      <div className="h-24 w-40 p-1">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-white text-black">
          <DocumentIcon className="h-10 w-10" />
          <a
            className="text-sm text-blue-600 hover:underline"
            href={message.mediaUrl}
          >
            Download File
          </a>
        </div>
      </div>
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
