import { ChatMessage as ChatMessageType } from '@/hooks/api/messages';
import {
  DocumentIcon,
  MusicalNoteIcon,
  NoSymbolIcon,
  PhotoIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from '@tanstack/react-router';
import { FC } from 'react';

const BaseBlockedMedia = ({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) => (
  <div className="flex h-28 w-48 flex-col items-center justify-center gap-2 rounded-xl bg-red-100 font-medium text-red-500">
    {icon}
    <div className="flex items-center gap-1 text-sm">
      <NoSymbolIcon className="h-4 w-4" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  </div>
);

export const BlockedMessage: FC<{
  messageType: ChatMessageType['messageType'];
}> = ({ messageType }) => {
  if (messageType === 'image') {
    return (
      <BaseBlockedMedia
        label="Blocked Image"
        icon={<PhotoIcon className="w-8" strokeWidth={2} />}
      />
    );
  }

  if (messageType === 'audio') {
    return (
      <BaseBlockedMedia
        label="Blocked Audio"
        icon={<MusicalNoteIcon className="w-8" strokeWidth={2} />}
      />
    );
  }

  if (messageType === 'data') {
    return (
      <BaseBlockedMedia
        label="Blocked File"
        icon={<DocumentIcon className="w-8" strokeWidth={2} />}
      />
    );
  }

  if (messageType === 'video') {
    return (
      <BaseBlockedMedia
        label="Blocked Video"
        icon={<PlayCircleIcon className="w-8" strokeWidth={2} />}
      />
    );
  }

  return (
    <span className="flex h-fit w-fit items-center gap-1 rounded-2xl bg-red-100 px-3 py-1.5 text-sm font-medium text-red-500">
      <NoSymbolIcon className="h-4 w-4" strokeWidth={2.5} />
      <span>Blocked</span>
    </span>
  );
};
