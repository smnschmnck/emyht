import { ChatInfoHeader } from './ChatInfoHeader';
import fallBackPP from '../assets/images/fallback-pp.webp';

interface ContactRequestResolverProps {
  senderID: string;
  senderProfilePicture: string;
  senderUsername: string;
  closeChat: () => void;
}

export const ContactRequestResolver: React.FC<ContactRequestResolverProps> = ({
  senderID,
  senderProfilePicture,
  senderUsername,
  closeChat,
}) => {
  return (
    <div>
      <ChatInfoHeader
        profilePictureUrl={fallBackPP.src}
        chatID={''}
        chatName={senderUsername}
        closeChat={closeChat}
      />
      <h1>Contact request from {senderUsername}</h1>
    </div>
  );
};
