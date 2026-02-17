import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
    id?: string;
    header: React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    /** When set, this column header becomes clickable and triggers onSort(sortKey) */
    sortKey?: string;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    className?: string;
    /** Current sort configuration — pass from useSort hook */
    sortConfig?: SortConfig | null;
    /** Called when a sortable header is clicked — pass handleSort from useSort */
    onSort?: (key: string) => void;
    /** Footer content rendered below the table body */
    footer?: React.ReactNode;
    /** Override the default header row className */
    headerClassName?: string;
}

function SortIcon({ sortKey, sortConfig }: { sortKey: string; sortConfig?: SortConfig | null }) {
    if (!sortConfig || sortConfig.key !== sortKey) {
        return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    }
    return sortConfig.direction === 'asc'
        ? <ArrowUp className="h-3 w-3" />
        : <ArrowDown className="h-3 w-3" />;
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    keyExtractor,
    emptyMessage = 'No data available',
    className,
    sortConfig,
    onSort,
    footer,
    headerClassName,
}: DataTableProps<T>) {
    return (
        <div className={cn("rounded-md border border-slate-200 overflow-hidden", className)}>
            <Table>
                <TableHeader className={headerClassName ?? "bg-[#2a3455]"}>
                    <TableRow className={cn("border-b-0", headerClassName ? "hover:bg-transparent" : "hover:bg-[#2a3455]")}>
                        {columns.map((col, index) => {
                            const isSortable = !!col.sortKey && !!onSort;
                            return (
                                <TableHead
                                    key={col.id ?? (col.accessorKey as string) ?? index}
                                    className={cn(
                                        "text-xs lg:text-sm font-semibold uppercase p-3 h-auto",
                                        !headerClassName && "text-white",
                                        isSortable && "cursor-pointer select-none hover:bg-white/10 transition-colors",
                                        col.headerClassName
                                    )}
                                    onClick={isSortable ? () => onSort(col.sortKey!) : undefined}
                                >
                                    {isSortable ? (
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            <SortIcon sortKey={col.sortKey!} sortConfig={sortConfig} />
                                        </div>
                                    ) : (
                                        col.header
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-slate-500"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow
                                key={keyExtractor(item)}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "border-slate-100 transition-colors group",
                                    onRowClick ? "cursor-pointer hover:bg-indigo-50/50" : ""
                                )}
                            >
                                {columns.map((col, index) => (
                                    <TableCell
                                        key={col.id ?? (col.accessorKey as string) ?? index}
                                        className={cn("p-2 text-xs lg:text-sm", col.className)}
                                    >
                                        {col.cell
                                            ? col.cell(item)
                                            : col.accessorKey
                                                ? (item[col.accessorKey] as React.ReactNode)
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {footer && footer}
        </div>
    );
}

