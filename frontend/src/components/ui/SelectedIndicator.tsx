import { CheckIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const SelectedIndicator: FC<{ selected: boolean }> = ({ selected }) => (
  <div
    className={twMerge(
      'grid h-4 w-4 place-items-center rounded-md p-[0.2rem] text-white',
      selected ? 'bg-blue-500' : 'border border-zinc-300'
    )}
  >
    {selected && <CheckIcon strokeWidth={4} />}
  </div>
);
