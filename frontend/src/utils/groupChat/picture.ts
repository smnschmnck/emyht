import { fetchWithDefaults } from '../fetch';

const fetchGroupChatPicturePutUrl = async (picture: File) => {
  const res = await fetchWithDefaults('/groupChatPicturePutURL', {
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
};

export const uploadGroupChatPicture = async (selectedPicture: File | null) => {
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
};
