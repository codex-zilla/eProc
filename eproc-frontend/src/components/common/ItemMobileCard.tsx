import React from 'react';
import { Truck, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { getProgressColor, getDeliveryStatus } from '@/lib/po-stats';

interface ItemMobileCardProps {
    item: {
        id: number;
        materialDisplayName: string;
        siteName?: string;
        orderedQty: number;
        totalDelivered: number;
        totalPrice: number;
    };
}

/**
 * ItemMobileCard – Mobile-friendly card for order line items.
 *
 * Displays material info, a 2×2 stats grid, delivery progress bar,
 * and an over-delivery warning when applicable.
 *
 * Designed to be reusable across any page that shows PO-style line items.
 */
export const ItemMobileCard: React.FC<ItemMobileCardProps> = ({ item }) => {
    const percent = item.orderedQty > 0
        ? Math.round((item.totalDelivered / item.orderedQty) * 100)
        : 0;
    const remaining = item.orderedQty - item.totalDelivered;
    const { label: statusLabel, color: statusColor } = getDeliveryStatus(item.totalDelivered, item.orderedQty);
    const progressColorClass = getProgressColor(percent);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.materialDisplayName}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Truck className="h-3 w-3" />
                        <span>{item.siteName || 'Main Site'}</span>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ordered</p>
                    <p className="font-bold text-slate-900 text-sm">{item.orderedQty}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Delivered</p>
                    <p className="font-bold text-slate-900 text-sm">{item.totalDelivered}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Remaining</p>
                    <p className={`font-bold text-sm ${remaining > 0 ? 'text-orange-500' : 'text-slate-900'}`}>
                        {remaining < 0 ? 0 : remaining}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Cost</p>
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(item.totalPrice)}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-medium text-slate-600">{percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColorClass}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {/* Over-delivery Warning */}
            {remaining < 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Over-delivered by {Math.abs(remaining)} units</span>
                </div>
            )}
        </div>
    );
};
