import { ChangeEvent } from 'react';
import styles from '../../styles/AtomicFilePicker.module.css';

interface FilePickerProps {
  buttonText?: string;
  handleFileChange?: (file: File) => void;
  children?: React.ReactNode;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  buttonText,
  handleFileChange: handleFile,
  children,
}) => {
  const getFileFromEvent = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      return target.files[0];
    }
  };

  const handleChange = (e: ChangeEvent) => {
    const file = getFileFromEvent(e);
    if (file && handleFile) {
      handleFile(file);
    }
  };

  return (
    <>
      {!children && (
        <label htmlFor="filePicker" className={styles.pseudoButton}>
          {buttonText ?? 'Pick a file'}
        </label>
      )}
      {children && (
        <label htmlFor="filePicker" className={styles.customButton}>
          {children}
        </label>
      )}
      <input
        id="filePicker"
        type="file"
        className={styles.hidden}
        onChange={handleChange}
      />
    </>
  );
};
