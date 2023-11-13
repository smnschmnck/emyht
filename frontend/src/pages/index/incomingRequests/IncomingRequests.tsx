import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

export const IncomingRequests: FC = () => {
  const { data } = useQuery(queryKeys.contacts.incomingRequests);
  console.log(data);
  return <ul>{data?.map((r) => <li>{r.senderUsername}</li>)}</ul>;
};
