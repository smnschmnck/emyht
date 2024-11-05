import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

export const SimpleErrorMessage: FC<{ children: string }> = ({ children }) => {
  const errorLowercase = children.toLowerCase();
  const firstLetter = errorLowercase.charAt(0).toUpperCase();
  const lastSubString = errorLowercase.substring(1, errorLowercase.length);
  const formattedError = `${firstLetter}${lastSubString}`;

  return (
    <div className="flex max-w-full gap-2 rounded-lg border border-red-500 bg-red-100 p-4 font-semibold text-red-500">
      <div>
        <ExclamationCircleIcon />
      </div>
      <p>{formattedError}</p>
    </div>
  );
};
