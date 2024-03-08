import { ChatMessage as ChatMessageType } from '@/api/messages';
import { queryKeys } from '@/configs/queryKeys';
import { formatTimestamp } from '@/utils/dateUtils';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

export const ChatMessage: FC<{ message: ChatMessageType }> = ({ message }) => {
  const { data } = useQuery(queryKeys.users.details);

  if (!data) {
    return <></>;
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
