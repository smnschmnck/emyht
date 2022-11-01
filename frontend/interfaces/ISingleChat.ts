interface ISingleChat {
  chatID: string;
  creationTimestamp: string;
  chatName: string;
  chatType: 'group' | 'oneOnOne' | 'contactRequest' | 'other';
  pictureUrl?: string;
  unreadMessages: number;
  messageType?: string;
  textContent?: string;
  timestamp?: string;
  deliveryStatus?: string;
  senderID?: string;
  senderUsername?: string;
}

export default ISingleChat;
