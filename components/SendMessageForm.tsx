import { FormEvent, useState } from 'react';
import { InputWithButton } from './atomic/InputWithButton';

interface SendMessageFormProps {
  chatID: string;
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatID }) => {
  const [messageInputValue, setMessageInputValue] = useState('');

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      //TODO extend to be able to send media
      messageType: 'plaintext',
      mediaUrl: '',
    };
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
    />
  );
};
