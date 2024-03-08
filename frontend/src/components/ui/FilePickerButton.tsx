import { FC } from 'react';

type FilePickerButtonProps = {
  id: string;
};

export const FilePickerButton: FC<FilePickerButtonProps> = ({ id }) => {
  return (
    <div>
      <input id={id} className="peer sr-only" type="file" multiple />
      <label
        htmlFor={id}
        className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white ring-offset-2 transition hover:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-600"
      >
        Add file
      </label>
    </div>
  );
};
