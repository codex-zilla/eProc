import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
    id?: string;
    header: React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    keyExtractor,
    emptyMessage = 'No data available',
    className,
}: DataTableProps<T>) {
    return (
        <div className={cn("rounded-md border border-slate-200 overflow-hidden", className)}>
            <Table>
                <TableHeader className="bg-[#2a3455]">
                    <TableRow className="hover:bg-[#2a3455] border-b-0">
                        {columns.map((col, index) => (
                            <TableHead
                                key={col.id ?? (col.accessorKey as string) ?? index}
                                className={cn(
                                    "text-white text-xs lg:text-sm font-semibold uppercase p-3 h-auto",
                                    col.headerClassName
                                )}
                            >
                                {col.header}
                            </TableHead>
                        ))}
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
        </div>
    );
}
