import React from 'react';
import { Truck, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
    id: number;
    materialName: string;
    unit: string;
    requestedQty: number;
    orderedQty: number;
    unitPrice: number;
    totalPrice: number;
    code?: string;
    siteName?: string;
}

interface CreatePOItemMobileCardProps {
    item: OrderItem;
    onUpdate: (id: number, field: 'orderedQty' | 'unitPrice', value: string) => void;
    onRemove: (id: number) => void;
}

export const CreatePOItemMobileCard: React.FC<CreatePOItemMobileCardProps> = ({ item, onUpdate, onRemove }) => {
    const isPartial = item.orderedQty > 0 && item.orderedQty < item.requestedQty;
    const isOver = item.orderedQty > item.requestedQty;
    const remaining = item.requestedQty - item.orderedQty;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between px-3 py-2 items-center bg-slate-100/60">
                <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.materialName}</h3>
                    {item.siteName && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Truck className="h-3 w-3" />
                            <span>{item.siteName}</span>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2"
                    onClick={() => onRemove(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Inputs Form */}
            <div className="space-y-3 p-3">
                {/* Ordered Qty Row */}
                <div className="grid grid-cols-3 content-center gap-2">
                    <label className="text-sm font-semibold text-[#2a3455] self-center shrink-0 w-24">Ordered Qty: </label>
                    <div className="relative flex-1 col-span-2">
                        {isPartial && (
                            <Badge variant="secondary" className="absolute -top-2 right-0 h-4 text-[9px] px-1.5 bg-amber-100 text-amber-700 border-none pointer-events-none z-10">
                                Partial
                            </Badge>
                        )}
                        {isOver && (
                            <Badge variant="secondary" className="absolute -top-2 right-0 h-4 text-[9px] px-1.5 bg-orange-100 text-orange-700 border-none pointer-events-none z-10">
                                Over
                            </Badge>
                        )}
                        <Input
                            type="number"
                            min="0"
                            value={item.orderedQty === 0 && item.orderedQty !== item.requestedQty ? '' : item.orderedQty}
                            placeholder="0"
                            onChange={(e) => onUpdate(item.id, 'orderedQty', e.target.value)}
                            className="h-8 font-semibold text-slate-900 bg-white border-slate-200 focus:border-indigo-500 transition-all"
                        />
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
                            className="h-8 font-mono bg-white border-slate-200 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested</p>
                    <p className="font-medium text-slate-700 text-sm">{item.requestedQty} <span className="text-xs text-slate-400 font-normal">{item.unit}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                    <p className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(item.totalPrice)}</p>
                </div>
            </div>

            {/* Warnings */}
            {(remaining < 0) && (
                <div className="p-3 flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Over-ordering by {Math.abs(remaining)} units</span>
                </div>
            )}
        </div>
    );
};
