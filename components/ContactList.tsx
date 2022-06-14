import { Input } from './atomic/Input';
import styles from '../styles/ContactListComponent.module.css';
import { SingleContact, SingleContactProps } from './SingleContact';
import { useState } from 'react';

interface ContactListProps {
  contacts: SingleContactProps[];
}

export const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
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

  return (
    <>
      <Input
        placeholder="Search contacts"
        onChange={(e) => searchContacts(e.target.value)}
      />
      <div className={styles.contacts}>
        {filteredContacts.map((contact) => (
          <SingleContact
            key={contact.name}
            name={contact.name}
            profilePictureUrl={contact.profilePictureUrl}
          />
        ))}
      </div>
    </>
  );
};
