import { PlusIcon } from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import { FC, ReactNode } from 'react';

const filePickerVariants = cva(
  'flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium ring-offset-2 transition peer-focus:ring-2 peer-focus:ring-blue-600',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-500',
        secondary: 'text-blue-600 bg-zinc-100 hover:bg-zinc-200',
        text: 'text-blue-600 hover:bg-zinc-100',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

type FilePickerButtonProps = {
  id: string;
  handleFileChange?: (files: FileList) => void;
  children?: ReactNode;
  multiple?: boolean;
} & VariantProps<typeof filePickerVariants>;

export const FilePickerButton: FC<FilePickerButtonProps> = ({
  id,
  handleFileChange,
  children,
  multiple = true,
  variant,
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
        multiple={multiple}
      />
      <label htmlFor={id} className={filePickerVariants({ variant })}>
        {!!children && children}
        {!children && (
          <div className="flex items-center justify-center gap-2">
            <PlusIcon className="h-6 w-6" />
            <span>Add file</span>
          </div>
        )}
      </label>
    </div>
  );
};
