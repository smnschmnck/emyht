import { FormEvent, useState } from 'react';
import { InputWithButton } from './atomic/InputWithButton';

interface SendMessageFormProps {
  chatID: string;
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatID }) => {
  const [messageInputValue, setMessageInputValue] = useState('');

  const sendMessage = (event: FormEvent) => {
    //TODO send message
    event.preventDefault();
    setMessageInputValue('');
    alert(`Sending Message with content: ${messageInputValue}\nTo: ${chatID}`);
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
