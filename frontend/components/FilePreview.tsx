import GarbageCan from '../assets/images/delete.svg';
import Plus from '../assets/images/plus.svg';
import Image from 'next/image';
import styles from '../styles/FilePreview.module.css';
import { FilePicker } from './atomic/FilePicker';

interface FilePreviewProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  setFiles,
}) => {
  const getFileUrl = (file: File) => {
    console.log(file.name);
    return URL.createObjectURL(file);
  };

  const deleteFile = (file: File) => {
    const filteredFiles = files.filter((f) => f !== file);
    setFiles(filteredFiles);
  };

  const addFiles = (newFiles: FileList) => {
    const newFilesArr: File[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles.item(i);
      if (file) {
        newFilesArr.push(file);
      }
    }
    setFiles([...files, ...newFilesArr]);
  };

  return (
    <div className={styles.mediaPreviewsContainer}>
      <div className={styles.mediaPreviews}>
        {files.map((file) => (
          <div key={getFileUrl(file)} className={styles.singlePreview}>
            <span className={styles.deleteButtonWrapper}>
              <button
                className={styles.delButton}
                onClick={() => deleteFile(file)}
              >
                <Image src={GarbageCan} alt="Delete" />
              </button>
            </span>
            <Image
              src={getFileUrl(file)}
              alt="Preview"
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
        <span className={styles.addButtonContainer}>
          <FilePicker handleFileChange={addFiles} multiple>
            <span className={styles.addButtonWrapper}>
              <Image src={Plus} alt="Add File" />
            </span>
          </FilePicker>
        </span>
      </div>
    </div>
  );
};
