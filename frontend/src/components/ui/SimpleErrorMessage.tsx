import { ErrorIcon } from '@/assets/icons/ErrorIcon';
import { FC } from 'react';

export const SimpleErrorMessage: FC<{ children: string }> = ({ children }) => {
  const errorLowercase = children.toLowerCase();
  const firstLetter = errorLowercase.charAt(0).toUpperCase();
  const lastSubString = errorLowercase.substring(1, errorLowercase.length);
  const formattedError = `${firstLetter}${lastSubString}`;

  return (
    <div className="flex max-w-full gap-2 rounded-md border border-red-500 bg-red-100 p-4 font-medium text-red-500">
      <div>
        <ErrorIcon />
      </div>
      <p>{formattedError}</p>
    </div>
  );
};
