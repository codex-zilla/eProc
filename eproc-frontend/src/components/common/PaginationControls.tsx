import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    totalFiltered: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    prevPage: () => void;
    nextPage: () => void;
    setPage: (page: number) => void;
}

/**
 * PaginationControls – Reusable pagination footer with page numbers and prev/next.
 *
 * Accepts the same shape returned by `usePagination`, so you can spread it directly:
 * ```tsx
 * <PaginationControls {...pagination} totalFiltered={filteredItems.length} />
 * ```
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalFiltered,
    hasPreviousPage,
    hasNextPage,
    prevPage,
    nextPage,
    setPage,
}) => {
    return (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalFiltered}</span> results
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-50 disabled:opacity-50"
                    disabled={!hasPreviousPage}
                    onClick={prevPage}
                >
                    <ChevronLeft className="h-4 w-4 text-slate-500" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="icon"
                        className={`h-8 w-8 ${page === currentPage ? 'bg-[#2a3455] text-white hover:bg-[#1e253e]' : 'hover:bg-slate-50'}`}
                        onClick={() => setPage(page)}
                    >
                        {page}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-50 disabled:opacity-50"
                    disabled={!hasNextPage}
                    onClick={nextPage}
                >
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                </Button>
            </div>
        </div>
    );
};
