import { PlusIcon } from '@heroicons/react/24/outline';
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
    <div className="w-full">
      <input
        onChange={handleChange}
        id={id}
        className="peer sr-only"
        type="file"
        multiple
      />
      <label
        htmlFor={id}
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white ring-offset-2 transition peer-focus:ring-2 peer-focus:ring-blue-600 hover:bg-blue-500"
      >
        <PlusIcon className="h-6 w-6" />
        <span>Add file</span>
      </label>
    </div>
  );
};
