import { FC } from 'react';
import { ContactRequests } from './components/ContactRequests';
import { ChatCreator } from './components/ChatCreator';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export const InitiationView: FC = () => {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex gap-6">
        <ButtonLink to="/" aria-label={'back'} className="h-8 w-8 lg:hidden">
          <ChevronLeftIcon className="text-zinc-400" />
        </ButtonLink>
        <div>
          <h1 className="text-xl font-semibold">Ready to connect?</h1>
          <p className="text-sm text-zinc-500">
            Start a new chat or send a contact request
          </p>
        </div>
      </div>
      <ContactRequests />
      <ChatCreator />
    </div>
  );
};
