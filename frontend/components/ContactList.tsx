import { Input } from './atomic/Input';
import styles from '../styles/ContactListComponent.module.css';
import { SingleContactOrChat, ContactOrChat } from './SingleContactOrChat';
import { useState } from 'react';
import { Loader } from './atomic/Loader';

interface ContactListProps {
  selectedContacts: string[];
  setSelectedContacts: (selectedContacts: string[]) => void;
  contacts: ContactOrChat[];
  multiselect?: boolean;
  isLoading?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
  selectedContacts,
  setSelectedContacts,
  contacts,
  multiselect,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const selectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(
        selectedContacts.filter((contactID) => contactID !== id)
      );
      return;
    }
    if (multiselect) {
      setSelectedContacts([...selectedContacts, id]);
      return;
    }
    setSelectedContacts([id]);
  };

  return (
    <>
      <Input
        placeholder="Search contacts"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {!isLoading && contacts.length > 0 && (
        <div className={styles.contacts}>
          {contacts
            .filter((contact) => {
              const lowerCaseContact = contact.name.toLowerCase();
              const lowerCaseQuery = searchQuery.toLowerCase();
              return lowerCaseContact.includes(lowerCaseQuery);
            })
            .map((contact) => (
              <SingleContactOrChat
                key={contact.id}
                id={contact.id}
                name={contact.name}
                profilePictureUrl={contact.profilePictureUrl}
                select={selectContact}
                selected={selectedContacts.includes(contact.id)}
              />
            ))}
        </div>
      )}
      {isLoading && (
        <div className={styles.info}>
          <div className={styles.spinnerWrapper}>
            <Loader></Loader>
          </div>
        </div>
      )}
      {!isLoading && contacts.length <= 0 && (
        <div className={styles.info}>
          <h2>No contacts</h2>
        </div>
      )}
    </>
  );
};
