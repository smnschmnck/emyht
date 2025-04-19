import { Contact } from '@/hooks/api/contacts';

export const contactsToEntities = (contacts?: Contact[]) => {
  return contacts?.map((contact) => ({
    id: contact.uuid,
    name: contact.username,
    pictureUrl: contact.pictureUrl,
  }));
};
