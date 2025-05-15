import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { EntityList } from '@/components/EntityList';
import { useChats, useCurrentChat } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGroupMembers, useMembersNotInGroup } from '../hooks/useMembers';
import { chatSettingsRoute } from '../route';
import { contactsToEntities } from '@/utils/contactsToEntities';
import { FilePickerButton } from '@/components/ui/FilePickerButton';
import { uploadGroupChatPicture } from '@/utils/groupChat/picture';

const GroupPicturePicker = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const { refetch: refetchChats } = useChats();
  const curChat = useCurrentChat(chatId);
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const picturePreview = selectedPicture
    ? URL.createObjectURL(selectedPicture)
    : curChat?.chatPictureUrl;

  const { mutate: updatePicture, isPending: isUpdatingPicture } = useMutation({
    mutationFn: async () => {
      const { fileID } = await uploadGroupChatPicture(selectedPicture);
      const res = await fetchWithDefaults(`/changeGroupPicture/${chatId}`, {
        method: 'post',
        body: JSON.stringify({ fileID }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      refetchChats();
      toast.success(`Successfully updated group picture`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold">Picture</h4>
      <div className="flex w-full items-center justify-center gap-4">
        <Avatar
          imgUrl={picturePreview}
          className="h-14 min-h-14 w-14 min-w-14"
        />
        <FilePickerButton
          multiple={false}
          id={'groupPicPicker'}
          handleFileChange={(fileList) => setSelectedPicture(fileList.item(0))}
          variant="secondary"
          accept="image/*"
        >
          Pick new picture
        </FilePickerButton>
      </div>
      <Button
        onClick={() => updatePicture()}
        isLoading={isUpdatingPicture}
        disabled={!selectedPicture}
      >
        Update Picture
      </Button>
    </div>
  );
};

const GroupPropertiesSettings = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const curChat = useCurrentChat(chatId);
  const { refetch: refetchChats } = useChats();
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: async () => {
      const res = await fetchWithDefaults('/leaveGroupChat', {
        method: 'post',
        body: JSON.stringify({ chatId }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      refetchChats();
      navigate({ to: '/' });
      toast.success(`Left group ${curChat?.chatName}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: renameGroup, isPending: isRenaming } = useMutation({
    mutationFn: async () => {
      const res = await fetchWithDefaults(`/changeGroupName/${chatId}`, {
        method: 'post',
        body: JSON.stringify({ newName }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      refetchChats();
      toast.success(`Renamed group to '${newName}'`);
      setNewName('');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Group Settings</h3>
        <p className="text-sm text-zinc-500">Adjust group properties </p>
      </div>
      <div className="flex flex-col gap-3">
        <FormInput
          label="Name"
          placeholder="New group name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={() => renameGroup()} isLoading={isRenaming}>
          Change name
        </Button>
      </div>
      <GroupPicturePicker />
      <div className="flex flex-col gap-3 text-red-500">
        <h4 className="text-sm font-semibold">Leave Group</h4>
        <Button
          variant="destructive"
          onClick={() => leaveGroup()}
          isLoading={isLeaving}
        >
          Leave Group
        </Button>
      </div>
    </Card>
  );
};

const GroupMemberRemove = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { refetch: refetchUsersNotInChat } = useMembersNotInGroup({ chatId });
  const {
    data: groupMembers,
    isLoading: isLoadingUsers,
    refetch: refetchGroupMembers,
  } = useGroupMembers({
    chatId,
  });

  const { mutate: removeUsers, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      const body = {
        uuidsToRemove: selectedUsers,
      };
      const res = await fetchWithDefaults(`/removeGroupMembers/${chatId}`, {
        method: 'put',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      setSelectedUsers([]);
      refetchUsersNotInChat();
      refetchGroupMembers();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const entities = contactsToEntities(groupMembers);

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Remove members from group</h3>
        <p className="text-sm text-zinc-500">
          Select the contacts you want to remove
        </p>
      </div>
      <div className="h-72">
        <EntityList
          entities={entities}
          isLoading={isLoadingUsers}
          selectedEntities={selectedUsers}
          setSelectedEntities={setSelectedUsers}
          emptyMessage="No users to remove"
          searchInputLabel={'Select users'}
        />
      </div>
      <Button
        variant="destructive"
        disabled={selectedUsers.length <= 0}
        isLoading={isRemoving}
        onClick={() => removeUsers()}
      >
        Remove users
      </Button>
    </Card>
  );
};

const GroupMemberAdd = () => {
  const { chatId } = chatSettingsRoute.useParams();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const {
    data: usersNotInChat,
    isLoading: isLoadingUsers,
    refetch: refetchUsersNotInChat,
  } = useMembersNotInGroup({ chatId });
  const { refetch: refetchGroupMembers } = useGroupMembers({ chatId });

  const { mutate: addUsers, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      const body = {
        chatID: chatId,
        participantUUIDs: selectedUsers,
      };
      const res = await fetchWithDefaults('/addUsersToGroupchat', {
        method: 'post',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      setSelectedUsers([]);
      refetchUsersNotInChat();
      refetchGroupMembers();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const entities = contactsToEntities(usersNotInChat);

  return (
    <Card>
      <div>
        <h3 className="text-sm font-semibold">Add members to group</h3>
        <p className="text-sm text-zinc-500">
          Select the contacts you want to add
        </p>
      </div>
      <div className="h-72">
        <EntityList
          emptyMessage="No users to add"
          entities={entities}
          isLoading={isLoadingUsers}
          selectedEntities={selectedUsers}
          setSelectedEntities={setSelectedUsers}
          searchInputLabel={'Search users'}
        />
      </div>
      <Button
        disabled={selectedUsers.length <= 0}
        onClick={() => addUsers()}
        isLoading={isAdding}
      >
        Add users
      </Button>
    </Card>
  );
};

export const GroupSettings = () => {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row">
      <GroupPropertiesSettings />
      <GroupMemberAdd />
      <GroupMemberRemove />
    </div>
  );
};
