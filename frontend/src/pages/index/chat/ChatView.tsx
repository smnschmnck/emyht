import { useChats } from '@/hooks/api/chats';
import { useChatMessages } from '@/hooks/api/messages';
import { useParams } from '@tanstack/react-router';
import { FC, useEffect, useRef, useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { FilePicker } from './components/FilePicker';

const MessageList: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: messages } = useChatMessages(chatId);
  const { refetch: refetchChats } = useChats();
  const lastMessage = useRef<null | HTMLLIElement>(null);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [chatId]);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
    refetchChats();
  }, [messages, refetchChats]);

  return (
    <ul className="flex h-20 w-full max-w-3xl grow flex-col gap-5 overflow-y-scroll pt-4">
      {messages?.map((message) => (
        <ChatMessage key={message.messageID} message={message} />
      ))}
      <li className="h-0 w-0 overflow-hidden opacity-0" ref={lastMessage}>
        end of messages
      </li>
    </ul>
  );
};

export const ChatView: FC = () => {
  const [showFilePicker, setShowFilePicker] = useState(false);
  const { chatId } = useParams({ from: '/indexLayoutRoute/chat/$chatId' });

  useEffect(() => {
    setShowFilePicker(false);
  }, [chatId]);

  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <ChatHeader chatId={chatId} />
      <div className="flex h-full w-full flex-col items-center px-6">
        {!showFilePicker && <MessageList chatId={chatId} />}
        {showFilePicker && <FilePicker setShowFilePicker={setShowFilePicker} />}
        <div className="flex h-24 w-full max-w-3xl items-center justify-center">
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
