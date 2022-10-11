import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import IUser from '../interfaces/IUser';
import { InputWithButton } from './atomic/InputWithButton';
import { ISingleMessage } from './MainChat';
import Image from 'next/image';
import Paperclip from '../assets/images/paperclip.svg';
import styles from '../styles/SendMessageForm.module.css';
import { FilePicker } from './atomic/FilePicker';
import { FilePreview } from './FilePreview';

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
  const [files, setFiles] = useState<File[]>([]);
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

  const sendHandler = (event: FormEvent) => {
    event.preventDefault();
    if (files.length > 0) {
      sendMessageWithFiles();
    } else {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const body = {
      chatID: chatID,
      textContent: messageInputValue,
      messageType: 'plaintext',
      mediaUrl: '',
    };
    sendRequest.mutate(body);
  };

  const createMessageBodyWithFile = (
    text: string,
    fileType: string,
    fileID: string
  ) => {
    let mediaType: string;
    if (fileType.startsWith('image')) {
      mediaType = 'image';
    } else if (fileType.startsWith('video')) {
      mediaType = 'video';
    } else if (fileType.startsWith('audio')) {
      mediaType = 'audio';
    } else {
      mediaType = 'data';
    }
    const body = {
      chatID: chatID,
      textContent: text,
      messageType: mediaType,
      mediaUrl: fileID,
    };
    return body;
  };

  const getFileUploadURLAndID = async (
    contentLength: number,
    fileExtension: string
  ) => {
    alert('HERE');
    const body = {
      contentLength: contentLength,
      fileExtension: fileExtension,
    };

    const res = await fetch('/api/getMessageMediaPutURL', {
      method: 'post',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('Failed to upload');
    }

    const json: {
      presignedPutURL: string;
      fileID: string;
    } = await res.json();

    console.log(json);

    return json;
  };

  const uploadFile = async (file: File) => {
    const fileSize = file.size;
    const splittedFileName = file.name.split('.');
    const extension = splittedFileName[splittedFileName.length - 1];
    const urlAndID = await getFileUploadURLAndID(fileSize, extension);
    const url = urlAndID.presignedPutURL;

    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: file,
        mode: 'cors',
      });
      if (!res.ok) {
        throw new Error('Failed to upload');
      }
      return urlAndID.fileID;
    } catch {
      throw new Error('Failed to upload');
    }
  };

  const fileMessageSender = async (file: File, text: string) => {
    const fileType = file.type;
    const id = await uploadFile(file);
    const body = createMessageBodyWithFile(text, fileType, id);
    console.log(body);
    sendRequest.mutate(body);
  };

  const sendMessageWithFiles = async () => {
    if (messageInputValue.length > 0 && files.length === 1) {
      const file = files[0];
      fileMessageSender(file, messageInputValue);
      return;
    }
    if (files.length >= 1) {
      files.forEach((file) => {
        fileMessageSender(file, '');
      });
      if (messageInputValue.length >= 1) {
        sendMessage();
      }
    }
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

  const fileChangeHandler = (files: FileList) => {
    const fileArr: File[] = [];
    const n = files.length;
    for (let i = 0; i < n; i++) {
      const f = files.item(i);
      if (f) {
        fileArr.push(f);
      }
    }
    setFiles(fileArr);
  };

  return (
    <div>
      {files.length > 0 && <FilePreview files={files} setFiles={setFiles} />}
      <InputWithButton
        buttonText={'Send'}
        inputPlaceHolder={'Type Message'}
        value={messageInputValue}
        setValue={setValueWithLengthCheck}
        submitHandler={sendHandler}
        buttonDisabled={messageInputValue.length <= 0 && files.length <= 0}
        error={error}
      >
        <FilePicker handleFileChange={fileChangeHandler} multiple>
          <div className={styles.buttonWrapper}>
            <span className={styles.attachmentButton}>
              <Image
                className={styles.symbol}
                src={Paperclip}
                alt="Add attachment"
                layout="fill"
                objectFit="contain"
              />
            </span>
          </div>
        </FilePicker>
      </InputWithButton>
    </div>
  );
};
