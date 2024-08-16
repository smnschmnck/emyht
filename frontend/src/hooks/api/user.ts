import { getUserData } from '@/api/user';
import { useQuery } from '@tanstack/react-query';

export const useUserData = () => {
  return useQuery({ queryKey: ['userDetails'], queryFn: getUserData });
};
