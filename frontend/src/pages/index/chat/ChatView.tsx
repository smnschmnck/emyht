import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';
import prettyBytes from 'pretty-bytes';
import { useLoader } from '@tanstack/react-router';
import { FC, useEffect, useRef, useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { MessageInput } from './components/MessageInput';
import { chatRoute } from './route';
import { ChatMessage } from './components/ChatMessage';
import { Button } from '@/components/ui/Button';
import { FilePickerButton } from '@/components/ui/FilePickerButton';

const MessageList: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: messages } = useQuery(queryKeys.messages.chat(chatId));
  const lastMessage = useRef<null | HTMLLIElement>(null);

  useEffect(() => {
    lastMessage.current?.scrollIntoView();
  }, [messages]);

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

type FilePreviewProps = {
  file: File;
};

const FilePreview: FC<FilePreviewProps> = ({ file }) => {
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="h-48 w-64 overflow-hidden rounded-xl border border-zinc-100 shadow-sm">
      <img
        src={previewUrl}
        alt={file.name}
        className="h-3/5 w-full bg-gray-300 object-cover"
      />
      <div className="flex flex-col gap-1 p-3 text-sm">
        <div className="flex items-center justify-between font-semibold">
          <p>{file.name}</p>
          <p>{prettyBytes(file.size)}</p>
        </div>
        <p className="text-zinc-500">{file.type}</p>
      </div>
    </div>
  );
};

const FilePicker: FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (fileList: FileList) => {
    const fileArr = [...files, ...Array.from(fileList)];

    setFiles(fileArr);
  };

  return (
    <div className="flex h-20 w-full grow flex-col p-8">
      <div className="flex w-full justify-between border-b px-2 pb-3">
        <div className="flex gap-2">
          <Button variant="secondaryDestructive">Cancel</Button>
          <Button variant="text">Deselect X files</Button>
          <Button variant="text">Remove X files</Button>
        </div>
        <FilePickerButton
          id="chatFilePicker"
          handleFileChange={handleFileChange}
        />
      </div>
      <div className="pt-12">
        {files.map((file) => (
          <FilePreview file={file} />
        ))}
      </div>
    </div>
  );
};

export const ChatView: FC = () => {
  const [showFilePicker, setShowFilePicker] = useState(false);
  const { chatId } = useLoader({ from: chatRoute.id });

  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <ChatHeader chatId={chatId} />
      <div className="flex h-full w-full flex-col items-center px-6">
        {!showFilePicker && <MessageList chatId={chatId} />}
        {showFilePicker && <FilePicker />}
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
