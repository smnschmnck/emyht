import styles from '../../styles/AtomicSettingEditor.module.css';
import { SmallButton } from './Button';

interface SettingEditorProps {
  settingName: string;
  settingValue: string;
}

export const SettingEditor: React.FC<SettingEditorProps> = ({
  settingName,
  settingValue,
}) => {
  return (
    <div className={styles.settingContainer}>
      <div className={styles.settingInfo}>
        <h4 className={styles.settingName}>{settingName}</h4>
        <p className={styles.settingValue}>{settingValue}</p>
      </div>
      <div className={styles.changeButton}>
        <SmallButton>Change</SmallButton>
      </div>
    </div>
  );
};
