import { useLoader } from '@tanstack/react-router';
import { FC } from 'react';
import { chatRoute } from './route';

export const ChatView: FC = () => {
  const { chatId } = useLoader({ from: chatRoute.id });

  return <h1>some chat with id: {chatId}</h1>;
};
