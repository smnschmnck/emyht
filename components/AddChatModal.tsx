import styles from '../styles/AddChatModal.module.css';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { ContactList } from './ContactList';
import { SingleContactProps } from './SingleContact';
import { Tab, Tabs } from './atomic/Tabs';

interface AddChatModalProps {
  closeHandler: () => void;
}

const fakeContacts: SingleContactProps[] = [
  {
    name: 'Maximilian Berger',
    profilePictureUrl:
      'https://loremflickr.com/cache/resized/65535_52016243732_73712e2714_b_640_480_nofilter.jpg',
  },
  {
    name: 'John Doe',
    profilePictureUrl:
      'https://loremflickr.com/cache/resized/65535_51950170317_e4c7332e32_c_640_480_nofilter.jpg',
  },
];

export const AddChatModal: React.FC<AddChatModalProps> = ({ closeHandler }) => {
  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.heading}>New chat</h2>
        </div>
        <div className={styles.interface}>
          <Tabs>
            <Tab label="Foo" picture={chat}>
              <ContactList contacts={fakeContacts} />
              <div className={styles.buttons}>
                <BigButton>Start chat</BigButton>
                <SmallButton onClick={closeHandler}>Cancel</SmallButton>
              </div>
            </Tab>
            <Tab label="Bar" picture={group}>
              <ContactList contacts={fakeContacts} />
              <div className={styles.buttons}>
                <BigButton>Create groupchat</BigButton>
                <SmallButton onClick={closeHandler}>Cancel</SmallButton>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </Modal>
  );
};
