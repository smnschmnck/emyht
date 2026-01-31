import { useEffect, useState } from 'react';

export const useDataChangeDetector = ({
  data,
  onChange,
  onNoChange,
}: {
  data: unknown;
  onChange: () => void;
  onNoChange?: () => void;
}) => {
  const [prevData, setPrevData] = useState(data);

  useEffect(() => {
    if (
      prevData !== null &&
      prevData !== undefined &&
      JSON.stringify(prevData) !== JSON.stringify(data)
    ) {
      onChange();
    } else {
      onNoChange?.();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrevData(data);
  }, [data, prevData, onChange, onNoChange]);
};
