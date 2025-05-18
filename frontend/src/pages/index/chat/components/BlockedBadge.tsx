import { NoSymbolIcon } from '@heroicons/react/24/outline';

export const BlockedBadge = () => (
  <div className="flex h-6 items-center gap-1 rounded-md bg-red-100 px-2 text-red-500">
    <NoSymbolIcon className="h-4 w-4" strokeWidth={2.5} />
    <span className="text-sm font-medium">Blocked</span>
  </div>
);
