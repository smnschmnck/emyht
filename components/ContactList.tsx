import { Input } from './atomic/Input';
import styles from '../styles/ContactListComponent.module.css';
import { SingleContact, Contact } from './SingleContact';
import { useState } from 'react';

interface ContactListProps {
  selectedContacts: string[];
  setSelectedContacts: (selectedContacts: string[]) => void;
  contacts: Contact[];
  multiselect?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
  selectedContacts,
  setSelectedContacts,
  contacts,
  multiselect,
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
      <div className={styles.contacts}>
        {contacts
          .filter((contact) => {
            const lowerCaseContact = contact.name.toLowerCase();
            const lowerCaseQuery = searchQuery.toLowerCase();
            return lowerCaseContact.includes(lowerCaseQuery);
          })
          .map((contact) => (
            <SingleContact
              key={contact.id}
              id={contact.id}
              name={contact.name}
              profilePictureUrl={contact.profilePictureUrl}
              selectContact={selectContact}
              selected={selectedContacts.includes(contact.id)}
            />
          ))}
      </div>
    </>
  );
};
