import { SettingEditor } from './atomic/SettingEditor';
import { ProfilePicChanger } from './ProfilePicChanger';
import { useMutation, useQuery } from '@tanstack/react-query';
import IUser from '../interfaces/IUser';
import { SettingSection } from './SettingSection';

export const UserSettings = () => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const profilePicUrl = user?.profilePictureUrl;

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
        changeHandler={(newVal) => alert('CHANGED TO: ' + newVal)}
      />
    </SettingSection>
  );
};
