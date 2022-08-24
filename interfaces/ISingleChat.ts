interface ISingleChat {
  chatID: string;
  creationTimestamp: string;
  chatName: string;
  pictureUrl?: string;
  unreadMessages: number;
  messageType?: string;
  textContent?: string;
  timestamp?: string;
  deliveryStatus?: string;
  senderID?: string;
}

export default ISingleChat;
