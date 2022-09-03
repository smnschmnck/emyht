import { FormEvent, useContext, useState } from 'react';
import { UserCtx } from '../pages';
import { InputWithButton } from './atomic/InputWithButton';
import { ISingleMessage } from './MainChat';

interface SendMessageFormProps {
  chatID: string;
  messages: ISingleMessage[];
  setMessages: (messages: ISingleMessage[]) => void;
  fetchMessages: (chatID: string) => void;
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
  fetchMessages,
}) => {
  const [messageInputValue, setMessageInputValue] = useState('');
  const [error, setError] = useState('');
  const user = useContext(UserCtx);
  const MAX_MESSAGE_LENGTH = 4096;

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
    if (messageInputValue.length > MAX_MESSAGE_LENGTH) {
      setError('Your message is too long');
      return;
    }
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      //TODO extend to be able to send media
      messageType: 'plaintext',
      mediaUrl: '',
    };
    setMessageInputValue('');
    createMessagePreview(body);
    const res = await fetch('/api/sendMessage', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError('FAILED TO SEND MESSAGE');
      fetchMessages(chatID);
      return;
    }
    const json: ISingleMessage[] = await res.json();
    setMessages(json);
  };

  const setValueWithLengthCheck = (val: string) => {
    if (val.length > MAX_MESSAGE_LENGTH + 1) {
      setError('Your message is too long');
      return;
    } else {
      setError('');
    }
    setMessageInputValue(val);
  };

  return (
    <InputWithButton
      buttonText={'Send'}
      inputPlaceHolder={'Type Message'}
      value={messageInputValue}
      setValue={setValueWithLengthCheck}
      submitHandler={sendMessage}
      buttonDisabled={messageInputValue.length <= 0}
      error={error}
    />
  );
};
