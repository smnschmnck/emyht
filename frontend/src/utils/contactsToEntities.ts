import { Contact } from '@/hooks/api/contacts';

export const contactsToEntities = (contacts?: Contact[]) => {
  return contacts?.map((contact) => ({
    id: contact.id,
    name: contact.username,
    pictureUrl: contact.pictureUrl,
  }));
};
