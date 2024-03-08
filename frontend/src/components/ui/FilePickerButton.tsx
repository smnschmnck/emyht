import { FC } from 'react';

type FilePickerButtonProps = {
  id: string;
  handleFileChange?: (files: FileList) => void;
};

export const FilePickerButton: FC<FilePickerButtonProps> = ({
  id,
  handleFileChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    handleFileChange?.(fileList);
  };

  return (
    <div>
      <input
        onChange={handleChange}
        id={id}
        className="peer sr-only"
        type="file"
        multiple
      />
      <label
        htmlFor={id}
        className="flex h-9 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white ring-offset-2 transition hover:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-600"
      >
        Add file
      </label>
    </div>
  );
};
