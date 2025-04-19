import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCurrentChat } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useChatsUserCanBeAddedTo } from '../hooks/useMembers';
import { chatSettingsRoute } from '../route';
import { EntityList } from '@/components/EntityList';

const UserPropertiesSettings = () => {
  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">User Settings</h3>
        <p className="text-sm text-zinc-500">Adjust properties</p>
      </div>
    </Card>
  );
};

const AddToGroup = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const {
    data: chatsUserCanBeAddedTo,
    isLoading: isLoadingChatsUserCanBeAddedTo,
    refetch: refetchChatsUserCanBeAddedTo,
  } = useChatsUserCanBeAddedTo({ uuid: chatId });
  const currentChat = useCurrentChat(chatId);

  const { mutate: addToChats, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      const body = {
        chatIDs: selectedChats,
        participantUUID: chatId,
      };
      const res = await fetchWithDefaults('/addSingleUserToGroupChats', {
        method: 'post',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      setSelectedChats([]);
      refetchChatsUserCanBeAddedTo();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const entities = chatsUserCanBeAddedTo?.map((chat) => ({
    id: chat.chatId,
    name: chat.chatName,
    pictureUrl: chat.pictureUrl,
  }));

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Add to groups</h3>
        <p className="text-sm text-zinc-500">
          Select the chats you want to add {currentChat?.chatName} to
        </p>
      </div>
      <div className="h-72">
        <EntityList
          entities={entities}
          isLoading={isLoadingChatsUserCanBeAddedTo}
          selectedEntities={selectedChats}
          setSelectedEntities={setSelectedChats}
          emptyMessage="No Chats"
          searchInputLabel="Search Chats"
        />
      </div>
      <Button
        disabled={selectedChats.length <= 0}
        onClick={() => addToChats()}
        isLoading={isAdding}
      >
        Add user
      </Button>
    </Card>
  );
};

export const UserSettings = () => {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <UserPropertiesSettings />
      <AddToGroup />
    </div>
  );
};
