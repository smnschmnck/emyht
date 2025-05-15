import { useChats } from '@/hooks/api/chats';
import { useChatMessages } from '@/hooks/api/messages';
import { useParams } from '@tanstack/react-router';
import { FC, useEffect, useRef, useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { FilePicker, FilePickerFile } from './components/FilePicker';
import { Spinner } from '@/components/ui/Spinner';

const MessageList: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: messages, isLoading: isLoadingMessages } =
    useChatMessages(chatId);
  const { refetch: refetchChats } = useChats();
  const scrollContainer = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollContainer.current?.scrollHeight;
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollContainer.current?.scrollHeight;
    }
    refetchChats();
  }, [messages, refetchChats]);

  return (
    <div
      ref={scrollContainer}
      className="flex w-full grow justify-center overflow-y-scroll pt-4"
    >
      {!messages && isLoadingMessages && (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      )}
      {!!messages && (
        <ul className="flex h-20 w-full max-w-3xl flex-col gap-5">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <li className="h-0 w-0 overflow-hidden opacity-0">end of messages</li>
        </ul>
      )}
    </div>
  );
};

export const ChatView: FC = () => {
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [files, setFiles] = useState<FilePickerFile[]>([]);
  const { chatId } = useParams({ from: '/indexLayoutRoute/chat/$chatId' });

  useEffect(() => {
    setShowFilePicker(false);
  }, [chatId]);

  const rawFiles = files.map((f) => f.file);

  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <ChatHeader chatId={chatId} />
      <div className="flex h-full w-full flex-col items-center px-6">
        {!showFilePicker && <MessageList chatId={chatId} />}
        {showFilePicker && (
          <FilePicker
            setFiles={setFiles}
            files={files}
            setShowFilePicker={setShowFilePicker}
          />
        )}
        <div className="flex h-24 w-full max-w-3xl items-center justify-center">
          <MessageInput
            resetFiles={() => setFiles([])}
            files={rawFiles}
            chatId={chatId}
            showFilePicker={showFilePicker}
            setShowFilePicker={setShowFilePicker}
          />
        </div>
      </div>
    </div>
  );
};
