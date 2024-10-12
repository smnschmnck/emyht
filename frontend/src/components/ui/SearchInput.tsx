import { FC } from 'react';
import { Input, InputProps } from './Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const SearchInput: FC<InputProps> = (props) => (
  <Input
    startAdornment={
      <div className="text-zinc-500">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    }
    {...props}
  />
);
