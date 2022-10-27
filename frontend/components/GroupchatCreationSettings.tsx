import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { formatError, formatPicURL } from '../helpers/stringFormatters';
import ISingleChat from '../interfaces/ISingleChat';
import styles from '../styles/GroupchatCreationSettings.module.css';
import { Avatar } from './atomic/Avatar';
import { BigButton, SmallButton } from './atomic/Button';
import { ErrorMessage } from './atomic/ErrorMessage';
import { FilePicker } from './atomic/FilePicker';
import { Input } from './atomic/Input';

interface GroupChatCreationSettingsProps {
  selectedContacts: string[];
  resetSelectedContacts: () => void;
  setSuccess: (success: boolean, chats: ISingleChat[]) => void;
  closeHandler: () => void;
}

export const GroupChatCreationSettings: React.FC<
  GroupChatCreationSettingsProps
> = ({ selectedContacts, resetSelectedContacts, setSuccess, closeHandler }) => {
  const [chatName, setChatName] = useState('');
  const [curPicture, setCurPicture] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const sendRequest = useMutation(
    ['chats'],
    async () => {
      let fileID = '';

      if (currentFile) {
        const fileSize = currentFile.size;
        const fileIDandURL = await getPresignedUrlAndID(fileSize);
        await uploadPicture(currentFile, fileIDandURL.presignedPutURL);
        fileID = fileIDandURL.fileID;
      }

      const body = {
        chatName: chatName,
        //TODO add functionality to add picture
        chatPictureID: fileID,
        participantUUIDs: selectedContacts,
      };

      const res = await fetch('/api/startGroupChat', {
        method: 'post',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        resetSelectedContacts();
        throw new Error(await res.text());
      }

      const json: ISingleChat[] = await res.json();
      return json;
    },
    {
      onSuccess: (chats) => {
        setSuccess(true, chats);
        queryClient.invalidateQueries(['chats']);
      },
    }
  );

  const getPresignedUrlAndID = async (contentLength: number) => {
    const res = await fetch('/api/getGroupChatPicturePutURL', {
      method: 'POST',
      body: JSON.stringify({ contentLength: contentLength }),
    });
    const json: { fileID: string; presignedPutURL: string } = await res.json();
    return json;
  };

  const uploadPicture = async (file: File, putURL: string) => {
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    const res = await fetch(putURL, {
      method: 'PUT',
      headers: headers,
      body: file,
      mode: 'cors',
    });

    if (!res.ok) throw new Error('Failed to upload');
  };

  const createGroupChat = async (e: FormEvent) => {
    e.preventDefault();
    sendRequest.mutate();
  };

  const handleFileChange = (files: FileList) => {
    const firstFile = files[0];
    setCurPicture(URL.createObjectURL(firstFile));
    setCurrentFile(firstFile);
  };

  return (
    <>
      <form className={styles.groupchatSettings} onSubmit={createGroupChat}>
        <h2 className={styles.groupchatSettingsHeading}>Groupchat settings</h2>
        <div className={styles.settings}>
          <div className={styles.picChanger}>
            <Avatar url={formatPicURL(curPicture)} size={'80px'} />
            <FilePicker
              handleFileChange={handleFileChange}
              buttonText="Select a picture"
            />
          </div>
          <Input
            placeholder="Chat name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            autoFocus
          />
        </div>
        <BigButton type="submit" disabled={chatName.length <= 0}>
          Create Groupchat
        </BigButton>
        {sendRequest.isError && (
          <ErrorMessage errorMessage={formatError(sendRequest.error)} />
        )}
      </form>
      <SmallButton onClick={closeHandler}>Close</SmallButton>
    </>
  );
};
