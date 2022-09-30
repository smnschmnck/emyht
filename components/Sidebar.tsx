import Image from 'next/image';
import styles from '../styles/SidebarComponent.module.css';
import logo from '../assets/images/emyht-logo.svg';
import Chats, { ContactRequest } from './Chats';
import UserInfoAndSettings from './UserInfoAndSettings';
import { ContactRequests } from './ContactRequests';
import { useQuery } from '@tanstack/react-query';

interface SidebarProps {
  chatOpened: boolean;
  openChat: (chatID: string) => void;
  openContactRequest: (contactRequestID: string) => void;
  setShowAddChatModal: (show: boolean) => void;
  setShowContactRequestModal: (show: boolean) => void;
  openSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chatOpened,
  openChat,
  setShowAddChatModal,
  setShowContactRequestModal,
  openContactRequest,
  openSettings,
}) => {
  const contactRequestsQuery = useQuery(['contactRequests'], async () => {
    const res = await fetch('/api/getPendingContactRequests');
    return (await res.json()) as ContactRequest[];
  });
  const contactRequests = contactRequestsQuery.data ?? [];
  return (
    <div className={styles.sidebar} id={chatOpened ? styles.closed : undefined}>
      <div className={styles.innerSidebar}>
        <div className={styles.logoContainer}>
          <Image src={logo} alt="emyht-logo" />
        </div>
        {contactRequests.length > 0 && (
          <>
            <div className={styles.contactRequestsWrapper}>
              <ContactRequests
                openContactRequest={openContactRequest}
                contactRequests={contactRequests}
              />
            </div>
            <hr />
          </>
        )}
        <Chats
          openChat={openChat}
          addChatButtonClickHandler={() => setShowAddChatModal(true)}
          sendFriendRequestButtonClickHandler={() =>
            setShowContactRequestModal(true)
          }
          setShowAddChatModal={setShowAddChatModal}
        />
      </div>
      <UserInfoAndSettings openSettings={openSettings} />
    </div>
  );
};
