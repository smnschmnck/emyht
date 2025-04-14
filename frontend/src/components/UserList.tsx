import { Avatar } from '@/components/ui/Avatar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { Contact } from '@/hooks/api/contacts';
import { useDataChangeDetector } from '@/hooks/utils/useDataChangeDetector';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const SelectedIndicator: FC<{ selected: boolean }> = ({ selected }) => (
  <div
    className={twMerge(
      'grid h-4 w-4 place-items-center rounded-md p-[0.2rem] text-white',
      selected ? 'bg-blue-500' : 'border border-zinc-300'
    )}
  >
    {selected && <CheckIcon strokeWidth={4} />}
  </div>
);

type UserListProps = {
  contacts?: Contact[];
  isLoading: boolean;
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
  emptyMessage?: string;
};

export const UserList: FC<UserListProps> = ({
  contacts,
  selectedUsers,
  isLoading,
  setSelectedUsers,
  emptyMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animationParent, enable] = useAutoAnimate();

  useDataChangeDetector({
    data: contacts,
    onChange: () => {
      enable(true);
    },
    onNoChange: () => {
      enable(false);
    },
  });

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

  const filteredUsers = contacts?.filter((contact) => {
    const curUsernameLowerCase = contact.username.toLowerCase();
    const queryLowerCase = searchQuery.toLowerCase();

    return curUsernameLowerCase.includes(queryLowerCase);
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <div>
        <SearchInput
          placeholder="Search contacts"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          handleClickClear={() => onSearchQueryChange('')}
        />
      </div>
      <div className="h-full overflow-scroll">
        <ul ref={animationParent}>
          {!!filteredUsers &&
            filteredUsers.map((contact) => (
              <li key={contact.uuid}>
                <button
                  onClick={() => changeUser(contact.uuid)}
                  aria-label={`Add ${contact.username} to chat`}
                  className="flex w-full items-center justify-between border-b border-b-zinc-100 p-2 transition hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-4">
                    <Avatar imgUrl={contact.pictureUrl} />
                    <p className="text-sm font-semibold">{contact.username}</p>
                  </div>
                  <SelectedIndicator
                    selected={selectedUsers.includes(contact.uuid)}
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
        {((!!filteredUsers && filteredUsers.length <= 0) || !filteredUsers) && (
          <div className="flex h-full w-full items-center justify-center py-8">
            {!!emptyMessage && (
              <span className="font-semibold text-zinc-500">
                {emptyMessage}
              </span>
            )}
            {!emptyMessage && (
              <span className="font-semibold text-zinc-500">No contacts</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
