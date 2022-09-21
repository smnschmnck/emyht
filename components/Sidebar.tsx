import Image from 'next/image';
import styles from '../styles/SidebarComponent.module.css';
import logo from '../assets/images/emyht-logo.svg';
import Chats, { ContactRequest } from './Chats';
import ISingleChat from '../interfaces/ISingleChat';
import UserInfoAndSettings from './UserInfoAndSettings';
import { ContactRequests } from './ContactRequests';
import { useContext } from 'react';
import { UserCtx } from './Main';

interface SidebarProps {
  chatOpened: boolean;
  allChats: ISingleChat[];
  contactRequests: ContactRequest[];
  handledContactReqs: string[];
  openChat: (chatID: string) => void;
  openContactRequest: (contactRequestID: string) => void;
  setShowAddChatModal: (show: boolean) => void;
  setShowContactRequestModal: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chatOpened,
  allChats,
  contactRequests,
  handledContactReqs,
  openChat,
  setShowAddChatModal,
  setShowContactRequestModal,
  openContactRequest,
}) => {
  const user = useContext(UserCtx);
  return (
    <div className={styles.sidebar} id={chatOpened ? styles.closed : undefined}>
      <div className={styles.innerSidebar}>
        <div className={styles.logoContainer}>
          <Image src={logo} alt="emyht-logo" />
        </div>
        {contactRequests.length > 0 &&
          !(contactRequests.length === handledContactReqs.length) && (
            <>
              <div className={styles.contactRequestsWrapper}>
                <ContactRequests
                  openContactRequest={openContactRequest}
                  contactRequests={contactRequests}
                  handledContactReqs={handledContactReqs}
                />
              </div>
              <hr />
            </>
          )}
        <Chats
          chats={allChats}
          openChat={openChat}
          addChatButtonClickHandler={() => setShowAddChatModal(true)}
          sendFriendRequestButtonClickHandler={() =>
            setShowContactRequestModal(true)
          }
          setShowAddChatModal={setShowAddChatModal}
        />
      </div>
      <UserInfoAndSettings
        username={user?.username ?? 'error'}
        email={user?.email ?? 'error'}
      />
    </div>
  );
};
