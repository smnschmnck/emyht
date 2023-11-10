import { Contact } from '@/api/contacts';
import { CheckMarkIcon } from '@/assets/icons/CheckmarkIcon';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const fakeUsers: Contact[] = [
  {
    id: 'jsnkjdnf',
    profilePictureUrl: 'default_1',
    name: 'John Doe',
  },
  {
    id: 'ubwetiwr',
    profilePictureUrl: 'default_4',
    name: 'John Doe',
  },
  {
    id: 'jdskfbskjd',
    profilePictureUrl: 'default_9',
    name: 'John Doe',
  },
  {
    id: 'o9b93r8b',
    profilePictureUrl: 'default_1',
    name: 'John Doe',
  },
  {
    id: 'udbsifbd9',
    profilePictureUrl: 'default_4',
    name: 'Jane Doe',
  },
  {
    id: 'ofsdnoin',
    profilePictureUrl: 'default_9',
    name: 'John Doe',
  },
];

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

  const filteredUsers = fakeUsers.filter((user) => {
    const curUsernameLowerCase = user.name.toLowerCase();
    const queryLowerCase = searchQuery.toLowerCase();

    return curUsernameLowerCase.includes(queryLowerCase);
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <div>
        <Input
          placeholder="Search user"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>
      <div className="h-full overflow-scroll">
        <ul className="pr-4">
          {filteredUsers.map((user) => (
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
                <SelectedIndicator selected={selectedUsers.includes(user.id)} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
