import { ChatMessage as ChatMessageType } from '@/hooks/api/messages';
import { useUserData } from '@/hooks/api/user';
import { formatTimestamp } from '@/utils/dateUtils';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

const MediaContent = ({ message }: { message: ChatMessageType }) => (
  <>
    {message.messageType === 'image' && (
      <div className="max-w-48 p-1">
        <a target="_blank" rel="noopener noreferrer" href={message.mediaUrl}>
          <img className="overflow-clip rounded-xl" src={message.mediaUrl} />
        </a>
      </div>
    )}
    {message.messageType === 'data' && (
      <a href={message.mediaUrl} className="group h-28 w-48 p-1">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-zinc-50 text-black transition hover:bg-zinc-100">
          <DocumentArrowDownIcon className="h-10 w-10" />
        </div>
      </a>
    )}
    {message.messageType === 'audio' && (
      <audio controls src={message.mediaUrl} />
    )}
    {message.messageType === 'video' && (
      <div className="max-w-48 p-1">
        <a target="_blank" rel="noopener noreferrer" href={message.mediaUrl}>
          <video className="overflow-clip rounded-xl" src={message.mediaUrl} />
        </a>
      </div>
    )}
  </>
);

export const ChatMessage: FC<{ message: ChatMessageType }> = ({ message }) => {
  const { data } = useUserData();

  if (!data) {
    return <></>;
  }

  if (data.uuid === message.senderID) {
    return (
      <li className="flex w-full flex-col items-end gap-1">
        {message.messageType !== 'plaintext' && (
          <MediaContent message={message} />
        )}
        {!!message.textContent && (
          <span className="w-fit rounded-2xl bg-blue-600 px-3 py-1.5 text-sm text-white">
            {message.textContent}
          </span>
        )}
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
      {message.messageType !== 'plaintext' && (
        <MediaContent message={message} />
      )}
      {!!message.textContent && (
        <span className="w-fit rounded-2xl bg-zinc-100 px-3 py-1.5 text-sm text-black">
          {message.textContent}
        </span>
      )}
    </li>
  );
};
