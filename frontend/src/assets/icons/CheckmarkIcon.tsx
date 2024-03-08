import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const CheckMarkIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={twMerge('h-2 w-2', className)}
    viewBox="0 0 8 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.875 3.8125L3.375 6.3125C3.375 6.3125 3.98806 4.86401 4.5 4C5.34137 2.58 7.125 0.6875 7.125 0.6875"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);
