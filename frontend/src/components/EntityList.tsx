import { Avatar } from '@/components/ui/Avatar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { useDataChangeDetector } from '@/hooks/utils/useDataChangeDetector';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { FC, useState } from 'react';
import { SelectedIndicator } from './ui/SelectedIndicator';

type Entity = {
  id: string;
  name: string;
  pictureUrl: string;
};

type EntityListProps = {
  entities?: Entity[];
  isLoading: boolean;
  selectedEntities: string[];
  setSelectedEntities: (selectedEntities: string[]) => void;
  emptyMessage: string;
  searchInputLabel: string;
};

export const EntityList: FC<EntityListProps> = ({
  entities,
  selectedEntities,
  isLoading,
  setSelectedEntities,
  emptyMessage,
  searchInputLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animationParent, enable] = useAutoAnimate();

  useDataChangeDetector({
    data: entities,
    onChange: () => {
      enable(true);
    },
    onNoChange: () => {
      enable(false);
    },
  });

  const toggleEntitySelection = (id: string) => {
    if (selectedEntities.includes(id)) {
      const filteredEntities = selectedEntities.filter((u) => u !== id);
      setSelectedEntities(filteredEntities);
      return;
    }

    setSelectedEntities([...selectedEntities, id]);
  };

  const onSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredEntities = entities?.filter((entity) => {
    const curNameLowerCase = entity.name.toLowerCase();
    const queryLowerCase = searchQuery.toLowerCase();

    return curNameLowerCase.includes(queryLowerCase);
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <div>
        <SearchInput
          placeholder={searchInputLabel}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          handleClickClear={() => onSearchQueryChange('')}
        />
      </div>
      <div className="h-full overflow-scroll">
        <ul ref={animationParent}>
          {!!filteredEntities &&
            filteredEntities.map((entity) => (
              <li key={entity.id}>
                <button
                  onClick={() => toggleEntitySelection(entity.id)}
                  aria-label={`Toggle ${entity.name} selection`}
                  className="flex w-full items-center justify-between border-b border-b-zinc-100 p-2 transition hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-4">
                    <Avatar imgUrl={entity.pictureUrl} />
                    <p className="text-sm font-semibold">{entity.name}</p>
                  </div>
                  <SelectedIndicator
                    selected={selectedEntities.includes(entity.id)}
                  />
                </button>
              </li>
            ))}
        </ul>
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center py-8">
            <Spinner />
          </div>
        )}
        {((!!filteredEntities && filteredEntities.length <= 0) ||
          !filteredEntities) && (
          <div className="flex h-full w-full items-center justify-center py-8">
            <span className="font-semibold text-zinc-500">{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
