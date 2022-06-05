interface ISingleChat {
  name: string;
  time: string;
  message: string;
  read: boolean;
  unreadMessagesCount?: number;
  ownMessage: boolean;
  deliveryStatus?: string;
  profilePictureUrl?: string;
}

export default ISingleChat;
