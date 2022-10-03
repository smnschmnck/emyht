import { SettingEditor } from './atomic/SettingEditor';
import { ProfilePicChanger } from './ProfilePicChanger';
import { useMutation, useQuery } from '@tanstack/react-query';
import IUser from '../interfaces/IUser';
import { SettingSection } from './SettingSection';
import { InfoMessage } from './atomic/InfoMessage';
import { useState } from 'react';
import { ErrorMessage } from './atomic/ErrorMessage';
import { formatError } from '../helpers/stringFormatters';

export const UserSettings = () => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const profilePicUrl = user?.profilePictureUrl;
  const [newEmail, setNewEmail] = useState(user?.email ?? '');

  const changeUsernameMutation = useMutation(
    async (newUsername: string) => {
      const body = {
        newUsername: newUsername,
      };
      const res = await fetch('/api/changeUsername', {
        method: 'post',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    {
      onSuccess: () => {
        userQuery.refetch();
      },
    }
  );

  const changeEmailMutation = useMutation(
    async (newEmail: string) => {
      const body = {
        newEmail: newEmail,
      };
      const res = await fetch('/api/changeEmail', {
        method: 'post',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewEmail(newEmail);
    },
    {
      onSuccess: () => {
        userQuery.refetch();
      },
    }
  );

  return (
    <SettingSection sectionName={'User Settings'}>
      <ProfilePicChanger
        profilePicUrl={profilePicUrl}
        refetchUser={userQuery.refetch}
      />
      <SettingEditor
        key={user?.username}
        settingName={'Username'}
        settingValue={user?.username ?? ''}
        changeHandler={changeUsernameMutation.mutate}
      />
      <SettingEditor
        settingName={'E-Mail'}
        settingValue={user?.email ?? ''}
        changeHandler={changeEmailMutation.mutate}
      >
        {changeEmailMutation.isSuccess && (
          <InfoMessage
            infoMessage={`Confirmation email has been sent to: ${newEmail}`}
          />
        )}
        {changeEmailMutation.isError && (
          <ErrorMessage errorMessage={formatError(changeEmailMutation.error)} />
        )}
      </SettingEditor>
    </SettingSection>
  );
};
