import { PusherContext } from '@/utils/pusher';
import { useContext } from 'react';

export const usePusher = () => {
  return useContext(PusherContext);
};
