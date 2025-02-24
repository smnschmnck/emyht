import { ButtonLink } from '@/components/ui/ButtonLink';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { chatSettingsRoute } from './route';
import { Chat, useChats } from '@/hooks/api/chats';
import { Link } from '@tanstack/react-router';

const Header = ({
  chatType,
  chatName,
}: {
  chatName?: string;
  chatType?: Chat['chatType'];
}) => {
  if (chatType === 'one_on_one') {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          Settings for user{' '}
          <Link to=".." className="text-blue-600 hover:underline">
            {chatName}
          </Link>
        </h1>
        <p className="text-sm text-zinc-500">
          Change settings and manage groups
        </p>
      </div>
    );
  }

  if (chatType === 'group') {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          Settings for group{' '}
          <Link to=".." className="text-blue-600 hover:underline">
            {chatName}
          </Link>
        </h1>
        <p className="text-sm text-zinc-500">
          Change settings and add or remove members
        </p>
      </div>
    );
  }
};

export const ChatSettingsView = () => {
  const { data: allChats } = useChats();
  const { chatId } = chatSettingsRoute.useParams();

  const curChat = allChats?.find((c) => c.chatID === chatId);

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex items-center justify-between gap-6">
        <Header chatType={curChat?.chatType} chatName={curChat?.chatName} />
        <ButtonLink to="/" aria-label={'back'} className="h-8 w-8">
          <XMarkIcon className="text-zinc-400" />
        </ButtonLink>
      </div>
    </div>
  );
};
