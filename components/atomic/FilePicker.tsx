import styles from '../../styles/AtomicFilePicker.module.css';

interface FilePickerProps {
  buttonText: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({ buttonText }) => {
  return (
    <>
      <label htmlFor="filePicker" className={styles.pseudoButton}>
        {buttonText}
      </label>
      <input id="filePicker" type={'file'} className={styles.hidden} />
    </>
  );
};
