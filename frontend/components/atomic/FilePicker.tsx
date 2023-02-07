import { ChangeEvent } from 'react';
import styles from '../../styles/AtomicFilePicker.module.css';

interface FilePickerProps {
  id: string;
  buttonText?: string;
  handleFileChange?: (file: FileList) => void;
  children?: React.ReactNode;
  multiple?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  id,
  buttonText,
  handleFileChange: handleFile,
  children,
  multiple,
}) => {
  const getFilesFromEvent = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      return target.files;
    }
  };

  const handleChange = (e: ChangeEvent) => {
    const fileList = getFilesFromEvent(e);
    if (fileList && handleFile) {
      handleFile(fileList);
    }
  };

  return (
    <>
      {!children && (
        <label htmlFor={id} className={styles.pseudoButton}>
          {buttonText ?? 'Pick a file'}
        </label>
      )}
      {children && (
        <label htmlFor={id} className={styles.customButton}>
          {children}
        </label>
      )}
      <input
        id={id}
        type="file"
        className={styles.hidden}
        onChange={handleChange}
        multiple={multiple}
      />
    </>
  );
};
