import { useState } from 'react';
import styles from '../../styles/AtomicSettingEditor.module.css';
import { SmallButton } from './Button';
import { Input } from './Input';

interface SettingEditorProps {
  settingName: string;
  settingValue: string;
  changeHandler: (newVal: string) => void;
}

export const SettingEditor: React.FC<SettingEditorProps> = ({
  settingName,
  settingValue,
  changeHandler,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editVal, setEditVal] = useState(settingValue);

  const saveChange = () => {
    if (editVal === settingValue) {
      closeEditMode();
      return;
    }
    changeHandler(editVal);
    closeEditMode();
  };

  const closeEditMode = () => {
    setEditVal(settingValue);
    setEditMode(false);
  };

  return (
    <div className={styles.settingContainer}>
      <div className={styles.settingInfo}>
        <h4 className={styles.settingName}>{settingName}</h4>
        {!editMode && <p className={styles.settingValue}>{settingValue}</p>}
        {editMode && (
          <div className={styles.editor}>
            <Input
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              autoFocus
            />
            <div className={styles.editModeControls}>
              <SmallButton onClick={saveChange}>Save</SmallButton>
              <SmallButton onClick={closeEditMode}>Cancel</SmallButton>
            </div>
          </div>
        )}
      </div>
      <div className={styles.changeButton}>
        {!editMode && (
          <SmallButton onClick={() => setEditMode(true)}>Change</SmallButton>
        )}
      </div>
    </div>
  );
};
