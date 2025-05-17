import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCurrentChat } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useChatsUserCanBeAddedTo } from '../hooks/useMembers';
import { chatSettingsRoute } from '../route';
import { EntityList } from '@/components/EntityList';

const useChatParticipant = ({ chatId }: { chatId: string }) => {
  return useQuery({
    queryKey: ['chatParticipant', { chatId }],
    queryFn: async () => {
      const res = await fetchWithDefaults(`/oneOnOneChatParticipant/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as { participantUUID: string };
    },
  });
};

const UserPropertiesSettings = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const { data: chatParticipant } = useChatParticipant({ chatId });

  const { mutate: blockUser, isPending: isBlocking } = useMutation({
    mutationFn: async () => {
      const body = {
        userID: chatParticipant?.participantUUID,
      };
      const res = await fetchWithDefaults('/blockUser', {
        method: 'post',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: () => {
      toast.success('User blocked successfully');
    },
  });

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">User Settings</h3>
        <p className="text-sm text-zinc-500">Adjust properties</p>
      </div>
      <div className="flex flex-col gap-3 text-red-500">
        <h4 className="text-sm font-semibold">Block User</h4>
        <Button
          variant="destructive"
          onClick={() => blockUser()}
          isLoading={isBlocking}
        >
          Block User
        </Button>
      </div>
    </Card>
  );
};

const AddToGroup = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const { data: chatParticipant } = useChatParticipant({ chatId });
  const {
    data: chatsUserCanBeAddedTo,
    isLoading: isLoadingChatsUserCanBeAddedTo,
    refetch: refetchChatsUserCanBeAddedTo,
  } = useChatsUserCanBeAddedTo({ uuid: chatParticipant?.participantUUID });
  const currentChat = useCurrentChat(chatId);

  const { mutate: addToChats, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      if (!chatParticipant?.participantUUID) {
        throw new Error('No UUID');
      }

      const body = {
        chatIDs: selectedChats,
        participantUUID: chatParticipant.participantUUID,
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
      toast.success('Successfully added to chat');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const entities = chatsUserCanBeAddedTo?.map((chat) => ({
    id: chat.id,
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
          emptyMessage="No chats user is not part of"
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
      <AddToGroup />
      <UserPropertiesSettings />
    </div>
  );
};
