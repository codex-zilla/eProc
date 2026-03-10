/**
 * MaterialItemsTable (Create Flow)
 *
 * Generic editable table for Material or Labour line items inside a BOQ Entry.
 * Eliminates duplication between the two near-identical tables in CreateRequest.tsx.
 *
 * Location: src/components/domain/requests/create/MaterialItemsTable.tsx
 * (distinct from the read-only MaterialItemsTable in requests/details/)
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import {
    RATE_TYPES,
    MATERIAL_UNITS,
} from '@/lib/request-constants';
import type { MaterialItem, LabourItem } from '@/hooks/useCreateRequest';

// ── Shared helpers ─────────────────────────────────────────────────────────

const rowAmount = (qty: string, rate: string) =>
    (parseFloat(qty) || 0) * (parseFloat(rate) || 0);

// ── Component ──────────────────────────────────────────────────────────────

interface MaterialItemsTableProps {
    boqTempId: string;
    mode: 'material' | 'labour';
    items: MaterialItem[] | LabourItem[];
    subtotal: number;
    onAdd: () => void;
    onRemove: (itemTempId: string) => void;
    onUpdate: (itemTempId: string, field: string, value: string) => void;
    errors?: Record<string, string>;
    sectionError?: string;
}

export const MaterialItemsTable: React.FC<MaterialItemsTableProps> = ({
    mode,
    items,
    subtotal,
    onAdd,
    onRemove,
    onUpdate,
    errors = {},
    sectionError,
}) => {
    const isMaterial = mode === 'material';
    const accentColor = isMaterial ? 'blue' : 'green';
    const addLabel = isMaterial ? 'Add Material' : 'Add Labour';
    const totalLabel = isMaterial ? 'Materials Total' : 'Labour Total';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                    <span
                        className={`h-2.5 w-2.5 rounded-full bg-${accentColor}-500 shrink-0`}
                    />
                    {isMaterial ? `Materials (${items.length})` : `Labour (${items.length})`}
                </h4>
                {sectionError && (
                    <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {sectionError}
                    </span>
                )}
            </div>

            <div className="hidden md:block rounded-md border border-slate-200 overflow-hidden">
                <Table className="text-xs table-fixed w-full">
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="px-3 py-2 font-semibold text-slate-600 pr-0 md:w-40 lg:w-48">
                                {isMaterial ? 'Material Name' : 'Labour Type / Role'}
                            </TableHead>
                            {isMaterial ? (
                                // Material-specific columns
                                <>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-14">Qty</TableHead>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-16">Unit</TableHead>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-20">Rate Type</TableHead>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-22">Rate (TZS)</TableHead>
                                </>
                            ) : (
                                // Labour-specific columns
                                <>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-18">Workers</TableHead>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-28">Days</TableHead>
                                    <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-24">Day Rate (TZS)</TableHead>
                                </>
                            )}
                            <TableHead className="px-3 py-2 pr-0 font-semibold text-slate-600 w-28 text-right">
                                Amount
                            </TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isMaterial
                            ? (items as MaterialItem[]).map(mat => (
                                <React.Fragment key={mat.tempId}>
                                    <TableRow className="hover:bg-slate-50/50">
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                value={mat.materialName}
                                                onChange={e => onUpdate(mat.tempId, 'materialName', e.target.value)}
                                                placeholder="e.g., Cement, Steel"
                                                className={`h-8 text-xs px-1.5 ${errors[mat.tempId] && !mat.materialName ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                type="number"
                                                value={mat.quantity}
                                                onChange={e => onUpdate(mat.tempId, 'quantity', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className={`h-8 text-xs px-1.5 ${errors[mat.tempId] && !mat.quantity ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2 pr-0 w-24">
                                            <Select
                                                value={mat.measurementUnit}
                                                onValueChange={val => onUpdate(mat.tempId, 'measurementUnit', val)}
                                            >
                                                <SelectTrigger className={`h-8 text-xs px-1.5 text-left ${errors[mat.tempId] && !mat.measurementUnit ? 'border-red-500' : ''}`}>
                                                    <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MATERIAL_UNITS.map(u => (
                                                        <SelectItem key={u.value} value={u.value} className="text-xs">
                                                            {u.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Select
                                                value={mat.rateEstimateType}
                                                onValueChange={val => onUpdate(mat.tempId, 'rateEstimateType', val)}
                                            >
                                                <SelectTrigger className="h-8 text-xs px-1.5 text-left">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RATE_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value} className="text-xs">
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                type="number"
                                                value={mat.rateEstimate}
                                                onChange={e => onUpdate(mat.tempId, 'rateEstimate', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className={`h-8 text-xs px-1.5 ${errors[mat.tempId] && !mat.rateEstimate ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2 pr-0 text-right font-semibold">
                                            {formatCurrency(rowAmount(mat.quantity, mat.rateEstimate))}
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2">
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRemove(mat.tempId)}
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    {errors[mat.tempId] && (
                                        <TableRow className="border-b-0 hover:bg-transparent">
                                            <TableCell colSpan={7} className="py-1 pb-2 px-2 border-0">
                                                <p className="text-[11px] font-medium text-red-500">{errors[mat.tempId]}</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                            : (items as LabourItem[]).map(lab => (
                                <React.Fragment key={lab.tempId}>
                                    <TableRow className="hover:bg-slate-50/50">
                                        {/* Labour Type / Role */}
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                value={lab.labourType}
                                                onChange={e => onUpdate(lab.tempId, 'labourType', e.target.value)}
                                                placeholder="e.g., Mason, Carpenter"
                                                className={`h-8 text-xs ${errors[lab.tempId] && !lab.labourType ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        {/* Number of labourers */}
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                type="number"
                                                value={lab.numberOfLabourers}
                                                onChange={e => onUpdate(lab.tempId, 'numberOfLabourers', e.target.value)}
                                                min="1"
                                                step="1"
                                                placeholder="e.g. 3"
                                                className={`h-8 text-xs ${errors[lab.tempId] && !lab.numberOfLabourers ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        {/* Number of days */}
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                type="number"
                                                value={lab.numberOfDays}
                                                onChange={e => onUpdate(lab.tempId, 'numberOfDays', e.target.value)}
                                                min="0.5"
                                                step="0.5"
                                                placeholder="e.g. 10"
                                                className={`h-8 text-xs ${errors[lab.tempId] && !lab.numberOfDays ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        {/* Day rate */}
                                        <TableCell className="py-1.5 px-2 pr-0">
                                            <Input
                                                type="number"
                                                value={lab.rateEstimate}
                                                onChange={e => onUpdate(lab.tempId, 'rateEstimate', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className={`h-8 text-xs ${errors[lab.tempId] && !lab.rateEstimate ? 'border-red-500' : ''}`}
                                            />
                                        </TableCell>
                                        {/* Computed amount (read-only) */}
                                        <TableCell className="py-1.5 px-2 pr-0 text-right font-semibold">
                                            {formatCurrency(
                                                (parseFloat(lab.numberOfLabourers) || 0) *
                                                (parseFloat(lab.numberOfDays) || 0) *
                                                (parseFloat(lab.rateEstimate) || 0)
                                            )}
                                        </TableCell>
                                        <TableCell className="py-1.5 px-2">
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRemove(lab.tempId)}
                                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    {errors[lab.tempId] && (
                                        <TableRow className="border-b-0 hover:bg-transparent">
                                            <TableCell colSpan={6} className="py-1 pb-2 px-2 border-0">
                                                <p className="text-[11px] font-medium text-red-500">{errors[lab.tempId]}</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
                {isMaterial
                    ? (items as MaterialItem[]).map(mat => (
                        <div key={mat.tempId} className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-1 pr-2">
                                    <label className="text-xs font-semibold text-slate-700">Material Name</label>
                                    <Input
                                        value={mat.materialName}
                                        onChange={e => onUpdate(mat.tempId, 'materialName', e.target.value)}
                                        placeholder="e.g., Cement, Steel"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(mat.tempId)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Quantity</label>
                                    <Input
                                        type="number"
                                        value={mat.quantity}
                                        onChange={e => onUpdate(mat.tempId, 'quantity', e.target.value)}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Unit</label>
                                    <Select
                                        value={mat.measurementUnit}
                                        onValueChange={val => onUpdate(mat.tempId, 'measurementUnit', val)}
                                    >
                                        <SelectTrigger className="h-8 text-xs w-full">
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MATERIAL_UNITS.map(u => (
                                                <SelectItem key={u.value} value={u.value} className="text-xs">
                                                    {u.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Rate Type</label>
                                    <Select
                                        value={mat.rateEstimateType}
                                        onValueChange={val => onUpdate(mat.tempId, 'rateEstimateType', val)}
                                    >
                                        <SelectTrigger className="h-8 text-xs w-full">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RATE_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value} className="text-xs">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Rate (TZS)</label>
                                    <Input
                                        type="number"
                                        value={mat.rateEstimate}
                                        onChange={e => onUpdate(mat.tempId, 'rateEstimate', e.target.value)}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Amount:</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(rowAmount(mat.quantity, mat.rateEstimate))}
                                </span>
                            </div>
                            {errors[mat.tempId] && (
                                <p className="text-xs font-medium text-red-500 mt-1">{errors[mat.tempId]}</p>
                            )}
                        </div>
                    ))
                    : (items as LabourItem[]).map(lab => (
                        <div key={lab.tempId} className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-1 pr-2">
                                    <label className="text-xs font-semibold text-slate-700">Labour Type / Role</label>
                                    <Input
                                        value={lab.labourType}
                                        onChange={e => onUpdate(lab.tempId, 'labourType', e.target.value)}
                                        placeholder="e.g., Mason, Carpenter"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                {items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(lab.tempId)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Workers</label>
                                    <Input
                                        type="number"
                                        value={lab.numberOfLabourers}
                                        onChange={e => onUpdate(lab.tempId, 'numberOfLabourers', e.target.value)}
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 3"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700">Days</label>
                                    <Input
                                        type="number"
                                        value={lab.numberOfDays}
                                        onChange={e => onUpdate(lab.tempId, 'numberOfDays', e.target.value)}
                                        min="0.5"
                                        step="0.5"
                                        placeholder="e.g. 10"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-xs font-semibold text-slate-700">Day Rate (TZS)</label>
                                    <Input
                                        type="number"
                                        value={lab.rateEstimate}
                                        onChange={e => onUpdate(lab.tempId, 'rateEstimate', e.target.value)}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="h-8 text-xs w-full"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Amount:</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(
                                        (parseFloat(lab.numberOfLabourers) || 0) *
                                        (parseFloat(lab.numberOfDays) || 0) *
                                        (parseFloat(lab.rateEstimate) || 0)
                                    )}
                                </span>
                            </div>
                            {errors[lab.tempId] && (
                                <p className="text-xs font-medium text-red-500 mt-1">{errors[lab.tempId]}</p>
                            )}
                        </div>
                    ))}
            </div>

            {/* Add row button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAdd}
                className={`h-7 text-xs border-${accentColor}-300 text-${accentColor}-700 hover:bg-${accentColor}-50`}
            >
                <Plus className="h-3 w-3 mr-1" />
                {addLabel}
            </Button>

            {/* Section subtotal */}
            <div
                className={`bg-${accentColor}-50 px-3 py-2 rounded flex flex-col gap-1`}
            >
                {!isMaterial && (
                    <p className="text-[10px] text-amber-700 italic">
                        ⚠ Labour costs are managed as site-direct costs and excluded from vendor Purchase Orders.
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">{totalLabel}:</span>
                    <span className={`text-sm font-bold text-${accentColor}-900`}>
                        {formatCurrency(subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
};
