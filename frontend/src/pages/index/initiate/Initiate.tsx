import { ButtonLink } from '@/components/ui/ButtonLink';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';
import { ChatCreator } from './components/ChatCreator';
import { ContactRequests } from './components/ContactRequests';

export const InitiationView: FC = () => {
  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Ready to connect?</h1>
          <p className="text-sm text-zinc-500">
            Start a new chat or send a contact request
          </p>
        </div>
        <ButtonLink to="/" aria-label={'back'} className="h-8 w-8">
          <XMarkIcon strokeWidth={2} className="text-zinc-500" />
        </ButtonLink>
      </div>
      <ContactRequests />
      <ChatCreator />
    </div>
  );
};
