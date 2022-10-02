import Image from 'next/image';
import { FilePicker } from './atomic/FilePicker';
import { formatError, formatPicURL } from '../helpers/stringFormatters';
import styles from '../styles/ProfilePicChanger.module.css';
import { useRef, useState } from 'react';
import { BigButton, SmallButton } from './atomic/Button';
import { useMutation } from '@tanstack/react-query';
import { ErrorMessage } from './atomic/ErrorMessage';

interface ProfilePicChangerProps {
  profilePicUrl?: string;
}

export const ProfilePicChanger: React.FC<ProfilePicChangerProps> = ({
  profilePicUrl,
}) => {
  const [curProfilePicURL, setCurProfilePicURL] = useState(profilePicUrl);
  const [showAcceptPrompt, setShowAcceptPrompt] = useState(false);
  const [showTooBigError, setShowTooBigError] = useState(false);
  const picFile = useRef<File | null>(null);

  const profilePicChangeHandler = (file: File) => {
    setShowTooBigError(false);
    const MEGABYTE = 1000000;
    const MAX_FILE_SIZE = 5 * MEGABYTE;
    uploadMutation.reset();
    if (file.size > MAX_FILE_SIZE) {
      setShowTooBigError(true);
      cancelChange();
      return;
    }
    setCurProfilePicURL(URL.createObjectURL(file));
    picFile.current = file;
    setShowAcceptPrompt(true);
  };

  const cancelChange = () => {
    setShowAcceptPrompt(false);
    setCurProfilePicURL(profilePicUrl);
    picFile.current = null;
  };

  const getPresignedURL = async (fileSize: number) => {
    const body = {
      contentLength: fileSize,
    };
    const res = await fetch('/api/getChangeProfilePicturePutURL', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const json: { presignedPutURL: string } = await res.json();
    return json.presignedPutURL;
  };

  const uploadProfilePicToS3 = async (file: File) => {
    const presignedUrl = await getPresignedURL(file.size);
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    try {
      const res = await fetch(presignedUrl, {
        method: 'PUT',
        headers: headers,
        body: file,
        mode: 'cors',
      });
      if (!res.ok) {
        throw new Error('Failed to upload');
      }
      return res;
    } catch {
      throw new Error('Failed to upload');
    }
  };

  const uploadMutation = useMutation((f: File) => uploadProfilePicToS3(f), {
    onSuccess: () => {
      setShowAcceptPrompt(false);
    },
    onError: () => {
      cancelChange();
    },
  });

  const saveChange = async () => {
    if (picFile.current) {
      uploadMutation.mutate(picFile.current);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.changePicContainer}>
        <div className={styles.profilePicContainer}>
          <Image
            src={formatPicURL(curProfilePicURL)}
            alt="Profile picture"
            layout="fill"
          />
        </div>
        {!showAcceptPrompt && (
          <div className={styles.changeButtons}>
            <FilePicker
              buttonText="Change Profile Picture"
              handleFileChange={profilePicChangeHandler}
            />
          </div>
        )}
        {showAcceptPrompt && (
          <div className={styles.acceptPrompt}>
            <div className={styles.saveButton}>
              <BigButton
                onClick={saveChange}
                loading={uploadMutation.isLoading}
              >
                Save
              </BigButton>
            </div>
            <SmallButton color="red" onClick={cancelChange}>
              Cancel
            </SmallButton>
          </div>
        )}
      </div>
      {uploadMutation.isError && (
        <ErrorMessage errorMessage={formatError(uploadMutation.error)} />
      )}
      {showTooBigError && <ErrorMessage errorMessage={'File too big'} />}
    </div>
  );
};
