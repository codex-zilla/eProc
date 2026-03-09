import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatNumber } from '@/lib/formatters';
import type { RequestItem } from '@/types/models';
import { MaterialUnit } from '@/types/models';

const MEASUREMENT_UNITS = Object.values(MaterialUnit).map(unit => ({ value: unit, label: unit }));

export interface ItemDetailModalProps {
    item: RequestItem;
    editValues: Partial<RequestItem>;
    isSaving: boolean;
    onClose: () => void;
    onSave: () => void;
    onEditChange: (values: Partial<RequestItem>) => void;
}

export const ItemDetailModal = ({ item, editValues, isSaving, onClose, onSave, onEditChange }: ItemDetailModalProps) => {
    const isRejected = item.status === 'REJECTED';

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#1e293b] rounded-t-lg">
                    <h3 className="text-base font-semibold text-white">
                        {item.resourceType === 'MATERIAL' ? 'Material' : 'Labour'} Details
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-slate-200 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Name + Status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</h4>
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        </div>
                        <StatusBadge status={item.status || 'PENDING'} type="request" className="text-[10px] font-bold uppercase tracking-wide" />
                    </div>

                    {/* Rejection Reason */}
                    {isRejected && (item.rejectionComment || item.comment) && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md text-sm">
                            <p className="font-bold mb-1 text-red-800">
                                Rejection Reason:{' '}
                                <span className="font-normal text-red-700">{item.rejectionComment || item.comment}</span>
                            </p>
                        </div>
                    )}

                    {/* Rate Type */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-1">Rate Type</h4>
                        <p className="text-sm text-slate-600">
                            {(isRejected ? editValues.rateType : item.rateType) === 'MARKET_RATE'
                                ? 'Market Rate'
                                : 'Engineer Estimate'}
                        </p>
                    </div>

                    {/* Fields */}
                    {isRejected ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                                    <input
                                        type="number"
                                        value={editValues.quantity || ''}
                                        onChange={(e) => onEditChange({ ...editValues, quantity: parseFloat(e.target.value) })}
                                        className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                                    <Select
                                        value={editValues.measurementUnit}
                                        onValueChange={(val) => onEditChange({ ...editValues, measurementUnit: val })}
                                    >
                                        <SelectTrigger className="w-full text-sm border-slate-300 h-[38px]">
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEASUREMENT_UNITS.map((unit) => (
                                                <SelectItem key={unit.value} value={unit.value} className="text-xs">
                                                    {unit.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (TZS)</label>
                                    <input
                                        type="number"
                                        value={editValues.rateEstimate || ''}
                                        onChange={(e) => onEditChange({ ...editValues, rateEstimate: parseFloat(e.target.value) })}
                                        className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                                    <div className="w-full text-sm bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-slate-700 font-medium">
                                        {formatNumber(((editValues.quantity || 0) * (editValues.rateEstimate || 0)), 2)}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                                    <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                                        {item.quantity.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                                    <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                                        {item.measurementUnit}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (TZS)</label>
                                    <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-white">
                                        {formatNumber(item.rateEstimate)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (TZS)</label>
                                    <div className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-700 bg-slate-50 font-medium">
                                        {formatNumber(item.quantity * item.rateEstimate, 2)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {item.workDescription && (
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                            <p className="text-sm text-slate-700">{item.workDescription}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg flex gap-3">
                    {isRejected ? (
                        <>
                            <Button
                                className="flex-1 bg-[#1e293b] hover:bg-[#0f172a] text-white"
                                onClick={onSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Updating...' : 'Update Material'}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-24 border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
