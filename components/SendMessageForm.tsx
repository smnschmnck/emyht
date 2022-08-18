import { FormEvent, useContext, useState } from 'react';
import { UserCtx } from '../pages';
import { InputWithButton } from './atomic/InputWithButton';
import { ISingleMessage } from './MainChat';

interface SendMessageFormProps {
  chatID: string;
  messages: ISingleMessage[];
  setMessages: (messages: ISingleMessage[]) => void;
}

interface INewMessage {
  chatID: string;
  textContent: string;
  //TODO extend to be able to send media
  messageType: string;
  mediaUrl: string;
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({
  chatID,
  messages,
  setMessages,
}) => {
  const [messageInputValue, setMessageInputValue] = useState('');
  const user = useContext(UserCtx);

  const createMessagePreview = (newMessage: INewMessage) => {
    const timeStamp = Math.round(new Date().getTime() / 1000);
    const message: ISingleMessage = {
      messageID: 'preview',
      senderID: user?.uuid ?? '',
      senderUsername: user?.username ?? '',
      textContent: newMessage.textContent,
      messageType: newMessage.messageType,
      medieUrl: newMessage.mediaUrl,
      timestamp: timeStamp,
      deliveryStatus: 'pending',
    };
    setMessages([...messages, message]);
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      //TODO extend to be able to send media
      messageType: 'plaintext',
      mediaUrl: '',
    };
    createMessagePreview(body);
    const res = await fetch('/api/sendMessage', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    setMessageInputValue('');
  };
  return (
    <InputWithButton
      buttonText={'Send'}
      inputPlaceHolder={'Type Message'}
      value={messageInputValue}
      setValue={setMessageInputValue}
      submitHandler={sendMessage}
      buttonDisabled={messageInputValue.length <= 0}
      autofocus
    />
  );
};
