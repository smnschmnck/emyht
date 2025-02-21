export const getFileType = (file: File) => {
  const fileType = file.type.split('/').at(0);

  switch (fileType) {
    case 'image':
      return fileType;

    case 'audio':
      return fileType;

    case 'video':
      return fileType;

    default:
      return 'data';
  }
};
