import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useCallback } from 'react';

export const useUploadGroupChatPicture = () => {
  const authFetch = useAuthFetch();

  const fetchGroupChatPicturePutUrl = useCallback(
    async (picture: File) => {
      const res = await authFetch('/groupChatPicturePutURL', {
        method: 'post',
        body: JSON.stringify({
          contentLength: picture.size,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as {
        fileID: string;
        presignedPutURL: string;
      };
    },
    [authFetch]
  );

  return useCallback(
    async (selectedPicture: File | null) => {
      if (!selectedPicture) {
        throw new Error('No picture selected');
      }
      const { presignedPutURL, fileID } =
        await fetchGroupChatPicturePutUrl(selectedPicture);

      const { ok: uploadSucess } = await fetch(presignedPutURL, {
        method: 'PUT',
        body: selectedPicture,
      });
      if (!uploadSucess) {
        throw new Error('Upload failed');
      }

      return { fileID };
    },
    [fetchGroupChatPicturePutUrl]
  );
};
