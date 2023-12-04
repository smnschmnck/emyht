import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useLoader } from '@tanstack/react-router';
import { FC, useEffect, useRef, useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { MessageInput } from './components/MessageInput';
import { chatRoute } from './route';
import { ChatMessage } from './components/ChatMessage';
import { Button } from '@/components/ui/Button';

const MessageList: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: messages } = useQuery(queryKeys.messages.chat(chatId));
  const lastMessage = useRef<null | HTMLLIElement>(null);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [messages]);

  return (
    <ul className="flex h-20 grow flex-col gap-5 overflow-y-scroll pt-4">
      {messages?.map((message) => (
        <ChatMessage key={message.messageID} message={message} />
      ))}
      <li className="h-0 w-0 overflow-hidden opacity-0" ref={lastMessage}>
        end of messages
      </li>
    </ul>
  );
};

const FilePicker: FC = () => {
  return (
    <div className="flex h-20 grow flex-col gap-5 overflow-y-scroll pt-4">
      <Button>Add files</Button>
    </div>
  );
};

export const ChatView: FC = () => {
  const [showFilePicker, setShowFilePicker] = useState(true);
  const { chatId } = useLoader({ from: chatRoute.id });

  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <ChatHeader chatId={chatId} />
      <div className="flex h-full w-full max-w-3xl flex-col px-6">
        {!showFilePicker && <MessageList chatId={chatId} />}
        {showFilePicker && <FilePicker />}
        <div className="flex h-24 items-center justify-center">
          <MessageInput
            chatId={chatId}
            showFilePicker={showFilePicker}
            setShowFilePicker={setShowFilePicker}
          />
        </div>
      </div>
    </div>
  );
};
