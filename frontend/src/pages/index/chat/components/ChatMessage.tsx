import { IconButton } from '@/components/ui/IconButton';
import { ChatMessage as ChatMessageType } from '@/hooks/api/messages';
import { useUserData } from '@/hooks/api/user';
import { formatTimestamp } from '@/utils/dateUtils';
import {
  ArrowsPointingOutIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@radix-ui/react-dialog';
import { FC, useState } from 'react';
import { BlockedMessage } from './BlockedMessage';

const getFileName = (s3Key: string) => {
  // Regular expression to match the file name after the last underscore
  // and before the query parameters (if any)
  const regex = /_(.+?\.[^?]+)(\?|$)/;

  const match = s3Key.match(regex);

  return match ? match[1] : null;
};

const Lightbox = ({
  onOpenChange,
  message,
}: {
  onOpenChange: (open: boolean) => void;
  message: ChatMessageType;
}) => {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden">
          {message.messageType === 'image' && (
            <img
              src={message.mediaUrl}
              className="max-h-[75vh] max-w-[75vw] object-contain"
            />
          )}
        </DialogContent>
        <DialogContent className="fixed top-0 right-0 items-center justify-center overflow-hidden">
          <div className="flex items-center gap-4 px-8 py-6">
            <DialogClose>
              <IconButton
                ariaLabel="Close Image View"
                className="bg-white hover:bg-blue-100"
              >
                <XMarkIcon strokeWidth={2} />
              </IconButton>
            </DialogClose>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

const MediaContent = ({ message }: { message: ChatMessageType }) => {
  const fileName = getFileName(message.mediaUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      {lightboxOpen && (
        <Lightbox onOpenChange={setLightboxOpen} message={message} />
      )}
      {message.messageType === 'image' && (
        <div className="relative overflow-clip rounded-xl">
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100"
          >
            <ArrowsPointingOutIcon className="absolute h-8 w-8 text-white" />
          </button>
          <img
            className="aspect-video max-w-48 min-w-48 bg-zinc-100 object-cover transition hover:opacity-50"
            src={message.mediaUrl}
          />
        </div>
      )}
      {message.messageType === 'data' && (
        <a
          title={fileName ?? ''}
          href={message.mediaUrl}
          className="group h-28 w-48 p-1"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl bg-zinc-50 text-black transition hover:bg-zinc-100">
            <DocumentArrowDownIcon className="h-10 w-10" />
            <span className="line-clamp-2 w-full px-4 text-center text-sm break-words break-all">
              {fileName}
            </span>
          </div>
        </a>
      )}
      {message.messageType === 'audio' && (
        <audio controls src={message.mediaUrl} />
      )}
      {message.messageType === 'video' && (
        <div className="max-w-48 p-1">
          <a target="_blank" rel="noopener noreferrer" href={message.mediaUrl}>
            <video
              className="overflow-clip rounded-xl"
              src={message.mediaUrl}
            />
          </a>
        </div>
      )}
    </>
  );
};

export const ChatMessage: FC<{ message: ChatMessageType }> = ({ message }) => {
  const { data } = useUserData();
  const [hideBlockedContent, setHideBlockedContent] = useState(true);

  const isBlockedContentHidden = hideBlockedContent && message.blocked;

  if (!data) {
    return <></>;
  }

  if (data.uuid === message.senderId) {
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
          {formatTimestamp(message.createdAt)}
        </span>
      </li>
    );
  }

  return (
    <li className="flex w-full flex-col items-start gap-1">
      <div className="flex gap-2">
        <span className="text-xs font-semibold">{message.senderUsername}</span>
        <span className="text-xs text-zinc-400">
          {formatTimestamp(message.createdAt)}
        </span>
      </div>
      <div className="group flex gap-2">
        {!isBlockedContentHidden && (
          <div className="flex w-full flex-col items-start gap-1">
            {message.messageType !== 'plaintext' && (
              <MediaContent message={message} />
            )}
            {!!message.textContent && (
              <span className="w-fit rounded-2xl bg-zinc-100 px-3 py-1.5 text-sm text-black">
                {message.textContent}
              </span>
            )}
          </div>
        )}
        {isBlockedContentHidden && (
          <BlockedMessage messageType={message.messageType} />
        )}
        {message.blocked && (
          <IconButton
            onClick={() => setHideBlockedContent((prev) => !prev)}
            className="text-zinc-400"
            ariaLabel={
              isBlockedContentHidden
                ? 'View blocked content'
                : 'Hide blocked content'
            }
          >
            {isBlockedContentHidden && <EyeIcon />}
            {!isBlockedContentHidden && <EyeSlashIcon />}
          </IconButton>
        )}
      </div>
    </li>
  );
};
