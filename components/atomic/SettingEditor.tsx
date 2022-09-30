import { FormEvent, useState } from 'react';
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

  const saveChange = (e: FormEvent) => {
    e.preventDefault();
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
          <form className={styles.editor} onSubmit={saveChange}>
            <Input
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              autoFocus
            />
            <div className={styles.editModeControls}>
              <SmallButton type="button" onClick={closeEditMode}>
                Cancel
              </SmallButton>
              <SmallButton type="submit">Save</SmallButton>
            </div>
          </form>
        )}
      </div>
      {!editMode && (
        <div className={styles.changeButton}>
          <SmallButton onClick={() => setEditMode(true)}>Change</SmallButton>
        </div>
      )}
    </div>
  );
};
