import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { WIDTH_BREAKPOINT } from '../helpers/clientGlobals';
import IUser from '../interfaces/IUser';
import styles from '../styles/ChatMessagesContainerComponent.module.css';
import { ISingleMessage } from './MainChat';
import { SingleChatMessage } from './SingleChatMessage';

interface ChatMessageContainerProps {
  chatID: string;
  chatOpened: boolean;
  openMediaModal: (mediaType: 'image' | 'video', mediaSource: string) => void;
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({
  chatID,
  chatOpened,
  openMediaModal,
}) => {
  const queryClient = useQueryClient();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [suspendAutoScroll, setSuspendAutoScroll] = useState(false);
  const scrollContainer = useRef<HTMLDivElement | null>(null);
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;

  const fetchMessages = useQuery(
    ['messages', chatID],
    async () => {
      const isCurSmallScreen = window.innerWidth < WIDTH_BREAKPOINT;
      if (!chatOpened && isCurSmallScreen) {
        return [];
      }
      const res = await fetch(`/api/getChatMessages/${chatID}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ISingleMessage[];
    },
    {
      onSuccess: () => {
        if (!suspendAutoScroll) {
          scrollMessagesToBottom();
        }
        queryClient.invalidateQueries(['chats']);
      },
    }
  );
  const messages = fetchMessages.data ?? [];

  const messageBottom = useRef<HTMLDivElement>(null);
  const scrollMessagesToBottom = () => {
    messageBottom.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (!suspendAutoScroll) {
      scrollMessagesToBottom();
    }
  }, [fetchMessages.data, suspendAutoScroll]);

  if (scrollContainer.current) {
    scrollContainer.current.onscroll = () => {
      if (scrollContainer.current) {
        if (
          scrollContainer.current.scrollTop ===
          scrollContainer.current.scrollHeight -
            scrollContainer.current.offsetHeight
        ) {
          setSuspendAutoScroll(false);
        } else {
          setSuspendAutoScroll(true);
        }
      }
    };
  }

  useEffect(() => {
    if (chatOpened) {
      fetchMessages.refetch();
    }
  }, [chatOpened, fetchMessages]);

  useEffect(() => {
    window.onresize = () => {
      const curSmall = window.innerWidth < WIDTH_BREAKPOINT;
      if (curSmall === isSmallScreen) return;
      if (curSmall) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
        fetchMessages.refetch();
      }
    };
  }, [fetchMessages, isSmallScreen]);

  return (
    <div className={styles.messages} ref={scrollContainer}>
      {messages.map((message) => (
        <span key={message.messageID}>
          <SingleChatMessage
            isPreview={message.messageID === 'preview'}
            timestamp={message.timestamp}
            textContent={message.textContent}
            senderUsername={message.senderUsername}
            byCurUser={message.senderID === user?.uuid}
            messageType={message.messageType}
            mediaUrl={message.mediaUrl}
            openMediaModal={openMediaModal}
          />
        </span>
      ))}
      <div ref={messageBottom} />
    </div>
  );
};
