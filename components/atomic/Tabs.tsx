import Image from 'next/image';
import styles from '../../styles/AtomicTabs.module.css';
import { Children, useState } from 'react';

interface TabProps {
  label: string;
  picture?: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children, label, picture }) => {
  return <>{children}</>;
};

interface TabsProps {
  initialTab?: number;
  children?: React.ReactElement<TabProps>[];
}

interface TabSelectorProps {
  tabNum: number;
  picture?: string;
  label: string;
  active: boolean;
  setCurTab: (curTab: number) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabNum,
  picture,
  label,
  active,
  setCurTab,
}) => {
  return (
    <button
      className={styles.selectorElement}
      id={active ? styles.active : ''}
      onClick={() => setCurTab(tabNum)}
    >
      <div className={styles.selectorLabel}>
        {picture && <Image src={picture} alt="group" objectFit={'contain'} />}
        <p className={styles.selectorLabelText}>{label}</p>
      </div>
    </button>
  );
};

export const Tabs: React.FC<TabsProps> = ({ children, initialTab }) => {
  const [curTab, setCurTab] = useState(initialTab ?? 0);
  const tabs = Children.toArray(children) as React.ReactElement<TabProps>[];
  return (
    <div className={styles.main}>
      <div className={styles.selector}>
        {tabs.map((t, i) => (
          <TabSelector
            tabNum={i}
            key={t.props.label}
            picture={t.props.picture}
            label={t.props.label}
            active={i == curTab}
            setCurTab={setCurTab}
          />
        ))}
      </div>
      <div className={styles.tabsContainer}>{tabs[curTab]}</div>
    </div>
  );
};
