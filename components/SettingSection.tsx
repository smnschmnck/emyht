import styles from '../styles/SettingSection.module.css';

interface SettingSectionProps {
  sectionName: string;
  children: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  sectionName,
  children,
}) => {
  return (
    <div className={styles.userSettings}>
      <h3 className={styles.settingHeading}>{sectionName}</h3>
      {children}
    </div>
  );
};
