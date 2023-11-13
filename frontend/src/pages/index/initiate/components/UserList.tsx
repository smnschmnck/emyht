import { CheckMarkIcon } from '@/assets/icons/CheckmarkIcon';
import { MagnifyingGlassIcon } from '@/assets/icons/MagnifyingGlassIcon';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const SelectedIndicator: FC<{ selected: boolean }> = ({ selected }) => (
  <div
    className={twMerge(
      'flex h-4 w-4 items-center justify-center rounded-full p-[0.2rem] text-white',
      selected ? 'bg-blue-500' : 'border border-zinc-300'
    )}
  >
    {selected && <CheckMarkIcon />}
  </div>
);

type UserListProps = {
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
};

export const UserList: FC<UserListProps> = ({
  selectedUsers,
  setSelectedUsers,
}) => {
  const { data: contacts, isLoading } = useQuery(queryKeys.contacts.all);
  const [searchQuery, setSearchQuery] = useState('');
  const changeUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      const filteredUsers = selectedUsers.filter((u) => u !== id);
      setSelectedUsers(filteredUsers);
      return;
    }

    setSelectedUsers([...selectedUsers, id]);
  };

  const onSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = contacts?.filter((user) => {
    const curUsernameLowerCase = user.name.toLowerCase();
    const queryLowerCase = searchQuery.toLowerCase();

    return curUsernameLowerCase.includes(queryLowerCase);
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <div>
        <Input
          placeholder="Search contacts"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          startAdornment={
            <div className="text-zinc-500">
              <MagnifyingGlassIcon />
            </div>
          }
        />
      </div>
      <div className="h-full overflow-scroll">
        <ul className="pr-4">
          {!!filteredUsers &&
            filteredUsers.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => changeUser(user.id)}
                  aria-label={`Add ${user.name} to chat`}
                  className="flex w-full items-center justify-between border-b border-b-zinc-100 p-2 transition hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-4">
                    <Avatar imgUrl={user.profilePictureUrl} />
                    <p className="text-sm font-semibold">{user.name}</p>
                  </div>
                  <SelectedIndicator
                    selected={selectedUsers.includes(user.id)}
                  />
                </button>
              </li>
            ))}
        </ul>
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center py-8">
            <Spinner />
          </div>
        )}
        {!!filteredUsers && filteredUsers.length <= 0 && (
          <div className="flex h-full w-full items-center justify-center py-8">
            <span className="font-semibold text-zinc-500">No contacts</span>
          </div>
        )}
      </div>
    </div>
  );
};
