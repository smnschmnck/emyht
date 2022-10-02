import { SettingEditor } from './atomic/SettingEditor';
import { ProfilePicChanger } from './ProfilePicChanger';
import { useQuery } from '@tanstack/react-query';
import IUser from '../interfaces/IUser';
import { SettingSection } from './SettingSection';

export const UserSettings = () => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const profilePicUrl = user?.profilePictureUrl;
  return (
    <SettingSection sectionName={'User Settings'}>
      <ProfilePicChanger
        profilePicUrl={profilePicUrl}
        refetchUser={userQuery.refetch}
      />
      <SettingEditor
        settingName={'Username'}
        settingValue={user?.username ?? ''}
        changeHandler={(newVal) => alert('CHANGED TO: ' + newVal)}
      />
      <SettingEditor
        settingName={'E-Mail'}
        settingValue={user?.email ?? ''}
        changeHandler={(newVal) => alert('CHANGED TO: ' + newVal)}
      />
    </SettingSection>
  );
};
