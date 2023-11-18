import { useLoader } from '@tanstack/react-router';
import { FC } from 'react';
import { chatRoute } from './route';
import { Avatar } from '@/components/ui/Avatar';
import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';

const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: allChats } = useQuery(queryKeys.chats.all);
  const { data: chatInfo } = useQuery(queryKeys.chats.info(chatId));

  const curChat = allChats?.find((c) => c.chatID === chatId);

  return (
    <div className="flex h-24 w-full items-center justify-center border-b border-b-zinc-100 bg-white">
      <div className="flex items-center justify-center gap-2">
        <Avatar imgUrl={curChat?.pictureUrl} alt={curChat?.chatName} />
        <div className="flex flex-col text-sm">
          <h1 className="font-semibold">{curChat?.chatName}</h1>
          <p className="text-zinc-500">{chatInfo?.info}</p>
        </div>
      </div>
    </div>
  );
};

export const ChatView: FC = () => {
  const { chatId } = useLoader({ from: chatRoute.id });

  return (
    <div>
      <ChatHeader chatId={chatId} />
    </div>
  );
};
