import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FilePickerButton } from '@/components/ui/FilePickerButton';
import { Input } from '@/components/ui/Input';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useUploadGroupChatPicture } from '@/utils/groupChat/picture';
import { useMutation } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';

type GroupChatCreatorProps = {
  selectedUsers: string[];
};

export const GroupChatCreator: FC<GroupChatCreatorProps> = ({
  selectedUsers,
}) => {
  const [chatName, setChatName] = useState('');
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const picturePreview = selectedPicture
    ? URL.createObjectURL(selectedPicture)
    : undefined;
  const { refetch: refetchChats } = useChats();
  const authFetch = useAuthFetch();
  const uploadGroupChatPicture = useUploadGroupChatPicture();

  const uploadPicture = async (selectedPicture: File | null) => {
    try {
      return await uploadGroupChatPicture(selectedPicture);
    } catch {
      return { fileID: undefined };
    }
  };

  const { mutate: createChat, isPending: isCreatingChat } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      if (selectedUsers.length <= 0) {
        return;
      }

      const { fileID } = await uploadPicture(selectedPicture);
      const res = await authFetch('/startGroupChat', {
        method: 'post',
        body: JSON.stringify({
          participantUUIDs: selectedUsers,
          chatName: chatName,
          chatPictureID: fileID,
        }),
      });

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
    },
    onSuccess: () => {
      setChatName('');
      toast.success('Chat created successfully');
      refetchChats();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const hasSelectedUsers = selectedUsers.length >= 1;

  return (
    <form
      onSubmit={(e: FormEvent) => {
        if (!isCreatingChat) {
          createChat(e);
        }
      }}
      className="flex h-full w-full flex-col gap-4"
    >
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
      <Input
        placeholder="Group name"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
      />
      <Button
        type="submit"
        disabled={!hasSelectedUsers || isCreatingChat}
        isLoading={isCreatingChat}
      >
        Create group
      </Button>
    </form>
  );
};
