import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type } from 'os';
import { FormEvent, useState } from 'react';
import IUser from '../interfaces/IUser';
import { InputWithButton } from './atomic/InputWithButton';
import { ISingleMessage } from './MainChat';

interface SendMessageFormProps {
  chatID: string;
}

interface INewMessage {
  chatID: string;
  textContent: string;
  //TODO extend to be able to send media
  messageType: string;
  mediaUrl: string;
}

export const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatID }) => {
  const queryClient = useQueryClient();
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const [messageInputValue, setMessageInputValue] = useState('');
  const [error, setError] = useState('');
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
    return message;
  };

  const sendRequest = useMutation(
    ['messages', chatID],
    async (newMessage: INewMessage) => {
      if (newMessage.textContent.length > MAX_MESSAGE_LENGTH) {
        setError('Your message is too long');
      }
      const res = await fetch('/api/sendMessage', {
        method: 'post',
        body: JSON.stringify(newMessage),
      });
      if (!res.ok) {
        setError('FAILED TO SEND MESSAGE');
      }
      const json: ISingleMessage[] = await res.json();
      return json;
    },
    {
      onMutate: async (newMessage) => {
        setMessageInputValue('');
        await queryClient.cancelQueries(['messages', chatID]);
        const previousMessages = queryClient.getQueryData<ISingleMessage[]>([
          'messages',
          chatID,
        ]);
        const preview = createMessagePreview(newMessage);
        queryClient.setQueryData<ISingleMessage[]>(
          ['messages', chatID],
          (oldMessages) => [...(oldMessages ?? []), preview]
        );
        return { previousMessages };
      },
      onError: (err, newMessages, context) => {
        class ctx {
          previousMessages: ISingleMessage[] | undefined;
        }
        if (context instanceof ctx) {
          queryClient.setQueryData(
            ['messages', chatID],
            context?.previousMessages ?? []
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['messages', chatID]);
        queryClient.invalidateQueries(['chats']);
      },
    }
  );

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      //TODO extend to be able to send media
      messageType: 'plaintext',
      mediaUrl: '',
    };
    sendRequest.mutate(body);
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
    >
      <p>hi</p>
    </InputWithButton>
  );
};
