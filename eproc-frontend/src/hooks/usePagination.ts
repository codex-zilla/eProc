import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Hook to manage pagination state and logic.
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is valid when total items change
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, pageSize, totalPages, currentPage]);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const setPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    setPage,
    setPageSize,
    startIndex,
    endIndex,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}
