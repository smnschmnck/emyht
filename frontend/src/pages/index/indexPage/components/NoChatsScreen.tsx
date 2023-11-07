import { FC } from 'react';
import { NewChatDialog } from '@/pages/index/components/NewChatDialog';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/configs/queryKeys';
import { ContactRequestDialog } from '../../components/ContactRequestDialog';

export const NoChatsScreen: FC = () => {
  const { data: contacts } = useQuery(queryKeys.chats.all);
  const hasContacts = !!contacts && contacts.length > 0;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="max-w-sm text-center text-4xl font-semibold">
          You currently don't have any {hasContacts ? 'chats' : 'contacts'} 🧐
        </h1>
        {hasContacts && <NewChatDialog />}
        {!hasContacts && <ContactRequestDialog />}
      </div>
    </div>
  );
};
