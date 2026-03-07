import React from 'react';
import { Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import type { POFormItem } from '@/types/models';

interface POFormItemCardProps {
    item: POFormItem;
    onUpdate: (id: number, field: 'orderedQty' | 'unitPrice', value: string) => void;
    isUpdateMode: boolean; // Add prop
}

export const POFormItemCard: React.FC<POFormItemCardProps> = ({ item, onUpdate, isUpdateMode }) => {

    const maxVal = item.maxAssignable ?? item.requestedQty;
    const isOverRequested = item.orderedQty > maxVal;

    // Partial logic (synced with desktop)
    // In update mode, partial means less than the remaining amount (maxVal).
    // In create mode, partial means less than the total requested amount.
    const isPartial = isUpdateMode
        ? item.orderedQty > 0 && item.orderedQty < maxVal
        : item.orderedQty > 0 && item.orderedQty < item.requestedQty;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between px-3 py-3 items-start bg-slate-50/50 border-b border-slate-100">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base truncate">{item.materialName}</h3>
                        <div className="flex items-center gap-1 ml-auto">
                            {isPartial && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1.5 h-5 text-[10px] whitespace-nowrap">
                                    ⚠ Partial
                                </Badge>
                            )}
                            {item.totalDelivered && item.totalDelivered > 0 ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1.5 h-5 whitespace-nowrap">
                                    Delivered: {item.totalDelivered}
                                </Badge>
                            ) : null}
                        </div>
                    </div>

                    {item.siteName && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Truck className="h-3 w-3" />
                            <span>{item.siteName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-3 p-3">
                {/* Ordered Qty Row */}
                <div className="grid grid-cols-3 content-center gap-2">
                    <label className="text-sm font-semibold text-[#2a3455] self-center shrink-0 w-24">Ordered Qty: </label>
                    <div className="relative flex-1 col-span-2">
                        <Input
                            type="number"
                            min="0"
                            value={item.orderedQty === 0 && item.orderedQty !== maxVal ? '' : item.orderedQty}
                            placeholder="0"
                            onChange={(e) => onUpdate(item.id, 'orderedQty', e.target.value)}
                            disabled={isUpdateMode && (item.maxAssignable === 0)}
                            className={`h-9 font-semibold text-slate-900 bg-white border-slate-200 focus:border-[#2a3455] transition-all ${isOverRequested ? 'border-red-500 bg-red-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        {isOverRequested && (
                            <p className="text-[10px] text-red-600 font-medium mt-1">
                                Max: {maxVal}
                            </p>
                        )}
                    </div>
                </div>

                {/* Unit Price Row */}
                <div className="grid grid-cols-3 gap-2">
                    <label className="text-sm font-semibold text-[#2a3455] self-center shrink-0 w-24">Unit Cost:</label>
                    <div className="relative flex-1 col-span-2">
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                            placeholder="0.00"
                            onChange={(e) => onUpdate(item.id, 'unitPrice', e.target.value)}
                            disabled={isUpdateMode && (item.maxAssignable === 0)}
                            className="h-9 font-mono bg-white border-slate-200 focus:border-[#2a3455] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className={`p-3 pt-3 border-t border-slate-100 grid ${isUpdateMode ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center bg-slate-50/30`}>
                <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested</p>
                    <p className="font-medium text-slate-700 text-sm">{item.requestedQty} <span className="text-xs text-slate-400 font-normal">{item.unit.toLowerCase()}</span></p>
                </div>

                {isUpdateMode && (
                    <div className="text-center border-x border-slate-100 px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Remaining</p>
                        <p className="font-semibold text-sm text-slate-500">
                            {item.maxAssignable ?? 0}
                        </p>
                    </div>
                )}

                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                    <p className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(item.totalPrice)}</p>
                </div>
            </div>
        </div>
    );
};
