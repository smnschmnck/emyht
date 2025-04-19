import { FC } from 'react';
import { Input, InputProps } from './Input';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { IconButton } from './IconButton';

type SearchInputProps = InputProps & {
  handleClickClear?: () => void;
};

export const SearchInput: FC<SearchInputProps> = ({
  handleClickClear,
  ...props
}) => (
  <Input
    startAdornment={
      <div className="text-zinc-500">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </div>
    }
    endAdornment={
      <IconButton
        className="h-8 min-h-8 w-8 min-w-8 text-blue-300 hover:text-blue-600"
        onClick={handleClickClear}
        ariaLabel={'Clear search'}
      >
        <XMarkIcon className="h-4 w-4" />
      </IconButton>
    }
    {...props}
  />
);
