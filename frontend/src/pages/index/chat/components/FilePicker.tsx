import { Button } from '@/components/ui/Button';
import { FilePickerButton } from '@/components/ui/FilePickerButton';
import { getFileType } from '@/utils/fileType';
import { DocumentIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { nanoid } from 'nanoid';
import prettyBytes from 'pretty-bytes';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const FilePreview = ({
  file,
  id,
  selected,
  handleFileSelect,
}: {
  file: File;
  id: string;
  selected: boolean;
  handleFileSelect: (id: string) => void;
}) => {
  const fileType = getFileType(file);
  const previewUrl = URL.createObjectURL(file);

  return (
    <button
      className={twMerge(
        'flex h-48 w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-100 text-left shadow-xs transition hover:border-blue-300 md:w-64',
        selected ? 'border-2 border-blue-500 hover:border-blue-500' : ''
      )}
      onClick={() => handleFileSelect(id)}
    >
      {fileType === 'image' && (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-3/5 w-full bg-gray-300 object-cover"
        />
      )}
      {fileType === 'video' && (
        <video
          src={previewUrl}
          className="h-3/5 w-full bg-gray-300 object-cover"
        />
      )}
      {fileType === 'audio' && (
        <div className="flex h-3/5 w-full items-center justify-center bg-zinc-50">
          <MusicalNoteIcon className="h-8 w-8" />
        </div>
      )}
      {fileType === 'data' && (
        <div className="flex h-3/5 w-full items-center justify-center bg-zinc-50">
          <DocumentIcon className="h-8 w-8" />
        </div>
      )}
      <div className="flex flex-col gap-1 p-3 text-sm">
        <div className="flex items-center justify-between gap-2 font-semibold">
          <p className="truncate">{file.name}</p>
          <p className="min-w-fit text-right">{prettyBytes(file.size)}</p>
        </div>
        <p className="text-zinc-500">{file.type}</p>
      </div>
    </button>
  );
};

type ActionButtonsProps = {
  setShowFilePicker: (showFilePicker: boolean) => void;
  setFiles: (files: FilePickerFile[]) => void;
  handleRemoveSelected: () => void;
  selectedCount: number;
  handleDeselectAll: () => void;
  handleFileChange: (fileList: FileList) => void;
};

const ActionButtonsDesktop = ({
  setShowFilePicker,
  setFiles,
  handleRemoveSelected,
  selectedCount,
  handleDeselectAll,
  handleFileChange,
}: ActionButtonsProps) => (
  <div className="flex w-full justify-between">
    <div className="flex gap-2">
      <Button
        variant="secondaryDestructive"
        onClick={() => {
          setShowFilePicker(false);
          setFiles([]);
        }}
      >
        Cancel
      </Button>
      <Button variant="text" onClick={handleDeselectAll}>
        Deselect {selectedCount} files
      </Button>
      <Button variant="text" onClick={handleRemoveSelected}>
        Remove {selectedCount} files
      </Button>
    </div>
    <div>
      <FilePickerButton
        id="chatFilePickerTop"
        handleFileChange={handleFileChange}
      />
    </div>
  </div>
);

const ActionButtonsMobile = ({
  setShowFilePicker,
  setFiles,
  handleRemoveSelected,
  selectedCount,
  handleDeselectAll,
  handleFileChange,
}: ActionButtonsProps) => (
  <div className="flex w-full flex-col">
    <div className="flex gap-2">
      <Button
        className="w-full"
        variant="secondaryDestructive"
        onClick={() => {
          setShowFilePicker(false);
          setFiles([]);
        }}
      >
        Cancel
      </Button>
      <FilePickerButton
        id="chatFilePickerTop"
        handleFileChange={handleFileChange}
      />
    </div>
    <div className="flex">
      <Button className="w-full" variant="text" onClick={handleDeselectAll}>
        Deselect {selectedCount} files
      </Button>
      <Button className="w-full" variant="text" onClick={handleRemoveSelected}>
        Remove {selectedCount} files
      </Button>
    </div>
  </div>
);

export type FilePickerFile = {
  id: string;
  selected: boolean;
  file: File;
};

export const FilePicker: FC<{
  files: FilePickerFile[];
  setFiles: (files: FilePickerFile[]) => void;
  setShowFilePicker: (showFilePicker: boolean) => void;
}> = ({ files, setFiles, setShowFilePicker }) => {
  const handleFileChange = (fileList: FileList) => {
    const fileArr = Array.from(fileList).map((f) => ({
      id: nanoid(),
      file: f,
      selected: false,
    }));

    const updatedFileArr = [...files, ...fileArr];

    setFiles(updatedFileArr);
  };

  const handleFileSelect = (id: string) => {
    const newFileArr = files.map((f) => {
      if (f.id !== id) {
        return f;
      }

      return { ...f, selected: !f.selected };
    });

    setFiles(newFileArr);
  };

  const handleDeselectAll = () => {
    const newFileArr = files.map((f) => ({
      ...f,
      selected: false,
    }));

    setFiles(newFileArr);
  };

  const handleRemoveSelected = () => {
    const newFileArr = files.filter((f) => !f.selected);

    setFiles(newFileArr);
  };

  const selectedCount = files.filter((f) => f.selected).length;

  return (
    <div className="flex h-20 w-full grow flex-col py-4 md:px-8 md:py-8">
      <div className="flex w-full border-b md:px-2 md:pb-3">
        <div className="hidden w-full md:flex">
          <ActionButtonsDesktop
            setShowFilePicker={setShowFilePicker}
            setFiles={setFiles}
            handleRemoveSelected={handleRemoveSelected}
            selectedCount={selectedCount}
            handleDeselectAll={handleDeselectAll}
            handleFileChange={handleFileChange}
          />
        </div>
        <div className="flex w-full md:hidden">
          <ActionButtonsMobile
            setShowFilePicker={setShowFilePicker}
            setFiles={setFiles}
            handleRemoveSelected={handleRemoveSelected}
            selectedCount={selectedCount}
            handleDeselectAll={handleDeselectAll}
            handleFileChange={handleFileChange}
          />
        </div>
      </div>
      {files.length <= 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-medium">No files to upload</span>
            <span className="text-sm text-zinc-500">Please select a file</span>
          </div>
          <div>
            <FilePickerButton
              id="chatFilePickerCenter"
              handleFileChange={handleFileChange}
            />
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 overflow-y-scroll pt-4 md:pt-12">
          {files.map(({ file, id, selected }) => (
            <FilePreview
              file={file}
              selected={selected}
              id={id}
              handleFileSelect={handleFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
