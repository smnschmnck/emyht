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
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const searchContacts = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    setFilteredContacts(
      contacts.filter((contact) => {
        const lowerCaseContact = contact.name.toLowerCase();
        return lowerCaseContact.includes(lowerCaseQuery);
      })
    );
  };

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
        onChange={(e) => searchContacts(e.target.value)}
      />
      <div className={styles.contacts}>
        {filteredContacts.map((contact) => (
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
