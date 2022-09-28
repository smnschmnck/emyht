import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequest } from './Chats';
import { ChatView } from './ChatView';
import { ContactRequestDialog } from './ContactRequestDialog';
import { NoChatsInfo } from './NoChatsInfo';

interface MainChatProps {
  chatID: string;
  contactRequestID: string;
  closeChat: () => void;
  chatOpened: boolean;
  contactRequestOpened: boolean;
  chats: ISingleChat[];
  setShowAddChatModal: (show: boolean) => void;
  contactRequests: ContactRequest[];
  closeContactRequest: () => void;
}

export interface ISingleMessage {
  messageID: string;
  senderID: string;
  senderUsername: string;
  textContent: string;
  messageType: string;
  medieUrl: string;
  timestamp: number;
  deliveryStatus: string;
}

const MainChat: React.FC<MainChatProps> = ({
  chatID,
  closeChat,
  chatOpened,
  chats,
  setShowAddChatModal,
  contactRequestID,
  contactRequestOpened,
  contactRequests,
  closeContactRequest,
}) => {
  const getContactRequestByID = (id: string) => {
    return contactRequests.find((c) => c.senderID === id);
  };

  const isShowContactRequestDialog = () => {
    const open = contactRequests.length > 0 && !chatOpened;
    const noChats = chats.length <= 0 && contactRequests.length >= 0;
    return open || noChats;
  };

  return (
    <>
      {chats.length > 0 && !contactRequestOpened && (
        <ChatView
          chatID={chatID}
          closeChat={closeChat}
          chatOpened={chatOpened}
          chats={chats}
        />
      )}
      {chats.length <= 0 && contactRequests.length <= 0 && (
        <NoChatsInfo setShowAddChatModal={setShowAddChatModal} />
      )}
      {isShowContactRequestDialog() && (
        <ContactRequestDialog
          key={getContactRequestByID(contactRequestID)?.senderUsername ?? ''}
          senderID={contactRequestID}
          senderUsername={
            getContactRequestByID(contactRequestID)?.senderUsername ?? ''
          }
          closeChat={closeChat}
          senderProfilePicture={
            getContactRequestByID(contactRequestID)?.senderProfilePicture
          }
          closeHandler={closeContactRequest}
        />
      )}
    </>
  );
};

export default MainChat;
