import { useMemo, useCallback } from 'react';

/**
 * Utility functions for performance optimization
 */

// Memoized currency formatter
export const useCurrencyFormatter = () => {
  return useMemo(
    () =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }),
    []
  );
};

// Memoized date formatter
export const useDateFormatter = () => {
  return useMemo(
    () => ({
      format: (timestamp: bigint) =>
        new Date(Number(timestamp) / 1000000).toLocaleString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      formatShort: (timestamp: bigint) =>
        new Date(Number(timestamp) / 1000000).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    }),
    []
  );
};

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized filter function
export const useFilteredItems = <T>(
  items: T[] | undefined,
  filterFn: (item: T) => boolean
) => {
  return useMemo(() => {
    if (!items) return [];
    return items.filter(filterFn);
  }, [items, filterFn]);
};

// Batch update helper for reducing re-renders
export const useBatchUpdate = <T>(initialValue: T) => {
  const [value, setValue] = React.useState<T>(initialValue);
  const [pendingUpdates, setPendingUpdates] = React.useState<Partial<T>[]>([]);

  const queueUpdate = useCallback((update: Partial<T>) => {
    setPendingUpdates((prev) => [...prev, update]);
  }, []);

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.length > 0) {
      setValue((prev) => {
        let result = { ...prev };
        pendingUpdates.forEach((update) => {
          result = { ...result, ...update };
        });
        return result;
      });
      setPendingUpdates([]);
    }
  }, [pendingUpdates]);

  return { value, queueUpdate, flushUpdates };
};

// Import React for hooks
import * as React from 'react';
