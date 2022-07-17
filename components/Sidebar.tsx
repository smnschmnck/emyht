import Image from 'next/image';
import styles from '../styles/SidebarComponent.module.css';
import logo from '../assets/images/emyht-logo.svg';
import Chats, { ContactRequest } from './Chats';
import ISingleChat from '../interfaces/ISingleChat';
import UserInfoAndSettings from './UserInfoAndSettings';
import { ContactRequests } from './ContactRequests';

interface SidebarProps {
  chatOpened: boolean;
  allChats: ISingleChat[];
  contactRequests: ContactRequest[];
  openChat: (chatID: string) => void;
  username: string;
  email: string;
  setShowAddChatModal: (show: boolean) => void;
  setShowContactRequestModal: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chatOpened,
  allChats,
  contactRequests,
  openChat,
  username,
  email,
  setShowAddChatModal,
  setShowContactRequestModal,
}) => {
  return (
    <div className={styles.sidebar} id={chatOpened ? styles.closed : undefined}>
      <div className={styles.innerSidebar}>
        <div className={styles.logoContainer}>
          <Image src={logo} alt="emyht-logo" />
        </div>
        {contactRequests.length > 0 && (
          <div className={styles.contactRequestsWrapper}>
            <ContactRequests contactRequests={contactRequests} />
          </div>
        )}
        <Chats
          chats={allChats}
          contactRequests={contactRequests}
          openChat={openChat}
          addChatButtonClickHandler={() => setShowAddChatModal(true)}
          sendFriendRequestButtonClickHandler={() =>
            setShowContactRequestModal(true)
          }
        />
      </div>
      <UserInfoAndSettings username={username} email={email} />
    </div>
  );
};
