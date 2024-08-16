import { useEffect, useState } from 'react';

export const useDataChangeDetector = <T>({
  data,
  onChange,
  onNoChange,
}: {
  data: T;
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

    setPrevData(data);
  }, [data, prevData, onChange, onNoChange]);
};
