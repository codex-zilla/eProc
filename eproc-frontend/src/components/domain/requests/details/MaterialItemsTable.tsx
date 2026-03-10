import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { RequestItem } from '@/types/models';
import { RequestDuplicateWarning } from './RequestDuplicateWarning';
import React from 'react';
import { DataTable, type ColumnDef } from '@/components/common/DataTable';

export interface MaterialItemsTableProps {
    items: RequestItem[];
    label: string;
    subtotal: number;
    onRowClick?: (item: RequestItem) => void;
    actionRenderer?: (item: RequestItem) => React.ReactNode;
}

export const MaterialItemsTable = ({
    items,
    label,
    subtotal,
    onRowClick,
    actionRenderer,
}: MaterialItemsTableProps) => {
    // Detect if this section contains LABOUR items (to switch column headers)
    const isLabour = items.length > 0 && (items[0] as any).resourceType === 'LABOUR';

    const columns: ColumnDef<RequestItem>[] = [
        {
            id: 'item',
            header: 'Item',
            className: "px-2 py-2.5 font-medium text-slate-700 text-sm tracking-tighter",
            headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2",
            cell: (item) => (
                <>
                    {item.name}
                    {(item as any).isDuplicate && <RequestDuplicateWarning />}
                </>
            )
        },
        ...(isLabour ? [
            {
                id: 'workers',
                header: 'Workers',
                className: "px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
                cell: (item: RequestItem) => (item as any).numberOfLabourers ?? '—'
            },
            {
                id: 'days',
                header: 'Days',
                className: "px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
                cell: (item: RequestItem) => (item as any).numberOfDays ?? '—'
            },
            {
                id: 'dayRate',
                header: 'Day Rate (TZS)',
                className: "px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right hidden lg:table-cell",
                cell: (item: RequestItem) => formatNumber(item.rateEstimate)
            },
        ] : [
            {
                id: 'qty',
                header: 'Qty',
                className: "px-2 py-2.5 text-center text-sm font-mono text-slate-600 tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
                cell: (item: RequestItem) => item.quantity
            },
            {
                id: 'unit',
                header: 'Unit',
                className: "px-2 py-2.5 text-center text-sm text-slate-600 tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
                cell: (item: RequestItem) => item.measurementUnit
            },
            {
                id: 'rate',
                header: 'Rate (TZS)',
                className: "px-2 py-2.5 text-right text-sm text-slate-600 font-mono hidden lg:table-cell tracking-tighter",
                headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right hidden lg:table-cell",
                cell: (item: RequestItem) => formatNumber(item.rateEstimate)
            },
        ]),
        {
            id: 'amount',
            header: 'Amount (TZS)',
            className: "px-2 py-2.5 text-right text-sm font-medium font-mono text-slate-700 tracking-tighter",
            headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-right",
            cell: (item) => formatNumber(item.totalEstimate ?? item.quantity * item.rateEstimate)
        },
        {
            id: 'status',
            header: 'Status',
            className: "px-2 py-2.5 text-center tracking-tighter",
            headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
            cell: (item) => (
                <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5" />
            )
        }
    ];

    if (actionRenderer) {
        columns.push({
            id: 'actions',
            header: 'Actions',
            className: "px-2 py-2.5 text-center",
            headerClassName: "text-slate-800 text-xs sm:text-sm font-semibold px-2 py-2 text-center",
            cell: (item) => (
                <div onClick={(e) => e.stopPropagation()}>
                    {actionRenderer(item)}
                </div>
            )
        });
    }

    return (
        <div className="border-b border-slate-200">
            <h3 className="text-sm font-semibold text-[#2a3455] px-2 py-0 pt-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span>{label}</span>
                <span className="md:hidden text-xs font-normal">
                    Subtotal: <span className="font-bold font-mono">{formatCurrency(subtotal)}</span>
                </span>
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <DataTable
                    data={items}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    onRowClick={onRowClick}
                    className="border-none shadow-none"
                    headerClassName="bg-slate-100 border-b border-slate-200"
                />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {items.map((item) => (
                    <React.Fragment key={item.id}>
                        <div
                            className={`bg-slate-50 p-3 ps-4 space-y-2 border-b border-slate-200 ${onRowClick ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            <div className="space-y-1">
                                <p className="text-xs text-slate-600 mb-0">
                                    {label}
                                    {(item as any).isDuplicate && <RequestDuplicateWarning />}
                                </p>
                                <p className="font-bold text-sm text-slate-900">{item.name}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {isLabour ? (
                                    <>
                                        <div>
                                            <p className="text-slate-600">Workers</p>
                                            <p className="font-semibold text-slate-900">{(item as any).numberOfLabourers ?? '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Days / Rate</p>
                                            <p className="font-semibold text-slate-900">{(item as any).numberOfDays ?? '—'} / {formatCurrency(item.rateEstimate)}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-slate-600">Qty</p>
                                            <p className="font-semibold text-slate-900">{item.quantity} {item.measurementUnit}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Rate</p>
                                            <p className="font-semibold text-slate-900">{formatCurrency(item.rateEstimate)}</p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <p className="text-slate-600">Amount</p>
                                    <p className="font-semibold text-slate-900">{formatCurrency(item.totalEstimate ?? item.quantity * item.rateEstimate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-600">Status:</p>
                                    <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] px-2 py-0.5 uppercase font-bold" />
                                </div>
                                {actionRenderer && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {actionRenderer(item)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Subtotal */}
            <div className="bg-slate-50 px-2 py-2 justify-end border-t border-slate-200 hidden md:flex">
                <span className="text-sm font-medium text-slate-600 me-3">{label} Subtotal:</span>
                <span className="text-sm font-bold font-mono text-slate-900 pe-2 tracking-tighter">{formatCurrency(subtotal)}</span>
            </div>
        </div>
    );
};
