interface ISingleChat {
  chatID: string;
  name: string;
  time: string;
  lastMessage: string;
  read: boolean;
  unreadMessagesCount?: number;
  ownMessage: boolean;
  deliveryStatus?: string;
  profilePictureUrl?: string;
}

export default ISingleChat;
