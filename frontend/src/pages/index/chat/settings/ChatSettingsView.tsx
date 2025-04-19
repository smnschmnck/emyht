import { IconLink } from '@/components/ui/IconLink';
import { Chat, useCurrentChat } from '@/hooks/api/chats';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { chatSettingsRoute } from './route';
import { GroupSettings } from './components/GroupSettings';

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
  const { chatId } = chatSettingsRoute.useParams();
  const curChat = useCurrentChat(chatId);

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex justify-between">
        <Header chatType={curChat?.chatType} chatName={curChat?.chatName} />
        <IconLink to=".." aria-label={'back'} className="h-8 w-8">
          <XMarkIcon strokeWidth={3} className="text-zinc-500" />
        </IconLink>
      </div>
      {curChat?.chatType === 'group' && <GroupSettings />}
    </div>
  );
};
