import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { Loader2, ShoppingCart, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useProjectRequests } from '@/hooks/queries/useRequests';
import { useCreatePurchaseOrder, usePurchaseOrder, useUpdatePurchaseOrder } from '@/hooks/queries/usePurchaseOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { useDraft } from '@/hooks/useDraft';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { isRequired } from '@/lib/validators';
import { calculateItemAssignableStats } from '@/lib/po-stats';
import { LoadingSpinner, ErrorDisplay, EmptyState, DataTable, SearchInput, POFormItemCard } from '@/components/common';
import type { RequestMaterial, RequestDetail, POFormItem, PurchaseOrderDraft } from '@/types/models';



const PurchaseOrderForm = () => {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const isUpdateMode = !!id;
    const navigateRole = useRoleNavigate();

    // Query params for creation
    const queryProjectId = searchParams.get('projectId');
    const queryRequestId = searchParams.get('requestId');

    // For Update Mode: Fetch existing PO
    const { data: existingPO, isLoading: loadingPO, error: poError } = usePurchaseOrder(Number(id));

    // Derived IDs
    const projectId = isUpdateMode ? existingPO?.projectId : Number(queryProjectId);
    const requestId = isUpdateMode ? existingPO?.requestId : Number(queryRequestId);

    const { data: requests = [], isLoading: loadingRequests, error: requestsError } = useProjectRequests(projectId || 0);
    const createPOMutation = useCreatePurchaseOrder();
    const updatePOMutation = useUpdatePurchaseOrder();

    // Form State
    const [vendorName, setVendorName] = useState('General Vendor');
    const [notes, setNotes] = useState('');
    const [itemsMap, setItemsMap] = useState<Record<number, { orderedQty: number; unitPrice: number }>>({});
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [isInitialized, setIsInitialized] = useState(false);

    // Initial Load - Pre-fill data
    useEffect(() => {
        if (isUpdateMode && existingPO && !isInitialized && requests.length > 0) {
            // Find target request to map materials
            const request = requests.find(r => r.id === existingPO.requestId);
            if (request) {
                setVendorName(existingPO.vendorName || '');
                setNotes(existingPO.notes || '');

                const newItemsMap: Record<number, { orderedQty: number; unitPrice: number }> = {};

                // Map existing PO items to itemsMap
                existingPO.items.forEach(poItem => {
                    // Find material ID by name or some identifier.
                    // Ideally we should use material ID, but PO items refer to Request items by name (mostly).
                    // We need to match with `availableMaterials`.
                    // `RequestMaterial` has `name`.
                    const material = request.materials.find(m => m.name === poItem.materialDisplayName);
                    if (material) {
                        newItemsMap[material.id] = {
                            orderedQty: 0,
                            unitPrice: poItem.unitPrice
                        };
                    }
                });

                setItemsMap(newItemsMap);
                setIsInitialized(true);
            }
        } else if (!isUpdateMode && !isInitialized && requests.length > 0 && requestId) {
            // Create Mode: Pre-populate with Remaining Balance
            const request = requests.find(r => r.id === Number(requestId));
            if (request) {
                const newItemsMap: Record<number, { orderedQty: number; unitPrice: number }> = {};
                request.materials.forEach(m => {
                    // Assume orderedQuantity is fresh from backend
                    if (m.status === 'APPROVED') {
                        newItemsMap[m.id] = {
                            orderedQty: 0,
                            unitPrice: m.rateEstimate || 0
                        };
                    }
                });
                setItemsMap(newItemsMap);
                setIsInitialized(true);
            }
        }
    }, [isUpdateMode, existingPO, isInitialized, requests]);

    // Draft key
    const draftKey = `po_draft_${projectId}_${requestId || 'all'}`;

    const { saveData, clearData } = useDraft<PurchaseOrderDraft>({
        key: draftKey,
        shouldLoad: !isUpdateMode,
        onLoad: (draft) => {
            setVendorName(draft.vendorName || 'General Vendor');
            setNotes(draft.notes || '');
            setItemsMap(draft.items || {});
        }
    });

    // Auto-Save Effect (Only for Create Mode)
    const debouncedVendor = useDebounce(vendorName, 1000);
    const debouncedNotes = useDebounce(notes, 1000);
    const debouncedItems = useDebounce(itemsMap, 1000);

    useEffect(() => {
        if (!projectId || isUpdateMode) return;

        const draft: PurchaseOrderDraft = {
            vendorName: debouncedVendor,
            notes: debouncedNotes,
            deliveryDate: '',
            items: debouncedItems,
            lastSaved: Date.now()
        };

        saveData(draft);
    }, [debouncedVendor, debouncedNotes, debouncedItems, projectId, isUpdateMode, saveData]);

    // Derived Data
    const targetRequest = useMemo<RequestDetail | null>(() => {
        if (!requests || !requestId) return null;
        return requests.find((r: RequestDetail) => r.id === requestId) || null;
    }, [requests, requestId]);

    const availableMaterials = useMemo(() => {
        if (!targetRequest) return [];
        return (targetRequest.materials || []).filter((m: RequestMaterial) => m.status === 'APPROVED');
    }, [targetRequest]);

    // Compute Table Data
    const orderItems: POFormItem[] = useMemo(() => {
        return availableMaterials.map((material: RequestMaterial) => {
            const state = itemsMap[material.id] || {
                orderedQty: 0,
                unitPrice: material.rateEstimate || 0
            };

            const { totalDelivered, maxAssignable } = calculateItemAssignableStats(material, existingPO, isUpdateMode);

            return {
                id: material.id,
                materialName: material.name,
                unit: material.measurementUnit || 'PCS',
                requestedQty: material.quantity,
                orderedQty: state.orderedQty,
                unitPrice: state.unitPrice,
                totalPrice: state.orderedQty * state.unitPrice,
                code: `MAT-${material.id.toString().padStart(3, '0')}-001`,
                siteName: targetRequest?.siteName,
                totalDelivered,
                // Custom fields for logic
                maxAssignable,
            };
        });
    }, [availableMaterials, itemsMap, targetRequest, isUpdateMode, existingPO]);

    const filteredItems = useMemo(() => {
        return orderItems.filter(item =>
            item.materialName.toLowerCase().includes(search.toLowerCase()) ||
            (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
        );
    }, [orderItems, search]);

    const totalPOValue = filteredItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Handlers
    const handleItemChange = (id: number, field: 'orderedQty' | 'unitPrice', value: string) => {
        const numValue = parseFloat(value);
        if (value !== '' && (isNaN(numValue) || numValue < 0)) return;

        setItemsMap(prev => {
            const currentItem = prev[id] || {
                orderedQty: 0,
                unitPrice: availableMaterials.find((m: RequestMaterial) => m.id === id)?.rateEstimate || 0
            };

            return {
                ...prev,
                [id]: {
                    ...currentItem,
                    [field]: value === '' ? 0 : numValue
                }
            };
        });
    };



    const handleSubmit = async () => {
        // Validation
        if (!isRequired(vendorName)) {
            toast.error('Vendor Name is required');
            return;
        }

        if (!targetRequest || !projectId || !requestId) return;

        // Strict Over-ordering Check
        const overOrderedItems = orderItems.filter(item => item.orderedQty > (item.maxAssignable ?? 0));
        if (overOrderedItems.length > 0) {
            toast.error(`Cannot order more than available for: ${overOrderedItems.map(i => i.materialName).join(', ')}`);
            return;
        }

        const validItems = orderItems.filter(item => item.orderedQty > 0);

        if (validItems.length === 0) {
            toast.error('At least one item must have a quantity greater than 0');
            return;
        }

        const itemDTOs = validItems.map(item => ({
            materialDisplayName: item.materialName,
            orderedQty: item.orderedQty,
            unit: item.unit,
            unitPrice: item.unitPrice
        }));

        try {
            const dto = {
                projectId,
                requestId,
                siteId: targetRequest.siteId,
                vendorName,
                notes,
                items: itemDTOs
            };
            await createPOMutation.mutateAsync(dto);

            // If it was "Update Mode", we are done with the "old" PO interaction, go back to list or details of NEW PO?
            clearData(); // Clear draft just in case
            toast.success(isUpdateMode ? 'Supplemental Purchase Order created successfully' : 'Purchase Order created successfully');
            navigateRole('/procurement/purchase-orders');
        } catch (error) {
            console.error('Failed to save PO:', error);
        }
    };

    // Columns for DataTable
    const columns: any[] = useMemo(() => {
        const cols = [
            {
                id: 'material',
                header: 'Material',
                accessorKey: 'materialName',
                cell: (item: POFormItem) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{item.materialName}</span>
                        {item.totalDelivered && item.totalDelivered > 0 ? (
                            <Badge variant="secondary" className="w-fit mt-1 bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 h-5 text-[10px]">
                                Delivered: {item.totalDelivered}
                            </Badge>
                        ) : null}
                    </div>
                ),
                className: 'pr-0 align-top py-3'
            },
            {
                id: 'unit',
                header: 'Unit',
                accessorKey: 'unit',
                className: 'pr-0',
                headerClassName: 'pr-0',
                cell: (item: POFormItem) => (
                    <span className='font-semibold text-slate-600'>{item.unit.toLocaleLowerCase()}</span>
                )
            },
            {
                id: 'reqQty',
                header: 'Req. Qty',
                accessorKey: 'requestedQty',
                className: 'font-medium text-slate-700 text-center',
                headerClassName: 'text-center',
                cell: (item: POFormItem) => (
                    <span>{item.requestedQty.toLocaleString()}</span>
                )
            },

            {
                id: 'unitPrice',
                header: 'Unit Cost',
                className: ' w-[120px] pr-0',
                headerClassName: 'pr-0',
                cell: (item: POFormItem) => (
                    <div className="relative">
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                            placeholder="0.00"
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}

                            disabled={isUpdateMode && (item.maxAssignable === 0)}
                            className="w-full font-semibold bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                )
            },
            {
                id: 'orderedQty',
                header: 'Ord. Qty',
                className: 'w-[120px] pr-0 align-top py-3',
                headerClassName: 'pr-0',
                cell: (item: POFormItem) => {
                    const maxVal = item.maxAssignable ?? item.requestedQty;
                    // In update mode, partial means less than the remaining amount (maxVal).
                    // In create mode, partial means less than the total requested amount.
                    const isPartial = isUpdateMode
                        ? item.orderedQty > 0 && item.orderedQty < maxVal
                        : item.orderedQty > 0 && item.orderedQty < item.requestedQty;

                    const isOverRequested = item.orderedQty > maxVal;

                    return (
                        <div className="relative">
                            {isPartial && (
                                <Badge variant="secondary" className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 text-[10px] px-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-sm z-10 whitespace-nowrap">
                                    ⚠ Partial
                                </Badge>
                            )}
                            <Input
                                type="number"
                                min="0"
                                value={item.orderedQty === 0 && item.orderedQty !== maxVal ? '' : item.orderedQty}
                                placeholder="0"
                                onChange={(e) => handleItemChange(item.id, 'orderedQty', e.target.value)}

                                disabled={isUpdateMode && (item.maxAssignable === 0)}
                                className={`w-full font-semibold bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm ${isOverRequested ? 'border-red-500 bg-red-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {isOverRequested && (
                                <p className="text-[10px] text-red-600 font-medium mt-1 text-center leading-tight">
                                    Max: {maxVal}
                                </p>
                            )}
                        </div>
                    );
                }
            },
            // Remaining column only if Update Mode
            ...(isUpdateMode ? [{
                id: 'remaining',
                header: 'Remaining',
                className: 'text-center align-top py-3',
                headerClassName: 'text-center',
                cell: (item: POFormItem) => {
                    const remaining = item.maxAssignable ?? 0;
                    return (
                        <span className={`font-semibold text-slate-500`}>
                            {remaining}
                        </span>
                    );
                }
            }] : []),
            {
                id: 'total',
                header: 'Total',
                className: 'pr-0 min-w-[100px]',
                cell: (item: POFormItem) => (
                    <span className="font-semibold text-slate-700 font-mono tracking-tighter">{formatCurrency(item.totalPrice)}</span>
                ),
                headerClassName: 'pr-0'
            },

        ];
        return cols;
    }, [itemsMap, availableMaterials, isUpdateMode, existingPO]);

    if (loadingRequests || (isUpdateMode && loadingPO)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text={isUpdateMode ? "Loading purchase order..." : "Loading request details..."} />
            </div>
        );
    }

    if (requestsError || (isUpdateMode && poError) || !targetRequest) {
        return (
            <ErrorDisplay
                error={(requestsError || poError) as Error || new Error('Data not found')}
                title="Failed to load data"
                onBack={() => navigateRole('/procurement/approved-requests')}
                backLabel="Back to Approved Requests"
            />
        );
    }

    if (availableMaterials.length === 0) {
        return (
            <EmptyState
                icon={ShoppingCart}
                title="No Approved Materials"
                description="This request has no approved materials to order."
                action={
                    <Button onClick={() => navigateRole('/procurement/approved-requests')}>
                        Return to Approved Requests
                    </Button>
                }
            />
        );
    }

    const isPending = createPOMutation.isPending || updatePOMutation.isPending;

    return (
        <div className="space-y-4 min-w-0 pb-10">
            {/* Header */}
            <Card className='shadow-none bg-transparent border-0'>
                <CardContent className='p-0 sm:p-3'>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-base lg:text-2xl font-bold text-[#2a3455] truncate">
                                    {isUpdateMode ? 'Update Order' : 'Create Purchase Order'}
                                </h1>
                                {isUpdateMode && (
                                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                                        {existingPO?.poNumber}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5 me-3">
                                    <span className='text-xs sm:text-sm'>Project: <span className="font-medium text-slate-700">{targetRequest.projectName}</span> (<span className="text-xs">{targetRequest.siteName}</span>)</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <span className='text-xs sm:text-sm'>Requested By: <span className="font-medium text-slate-700">{targetRequest.createdByName || 'Unknown'}</span></span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <span className='text-xs sm:text-sm'>Requested On: <span className="font-medium text-slate-700">{formatDate(targetRequest.createdAt)}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

                {/* Left Column - Main Content */}
                <Card className="flex flex-col shadow-none sm:shadow-sm border-none sm:border border-slate-200 bg-white order-1 lg:col-span-2 overflow-hidden">
                    <CardContent className="p-0">
                        {/* Top Form Section - Refactored Header */}
                        <div className="p-2 sm:p-3 relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
                                <div className={`flex items-center justify-between w-full sm:w-auto transition-opacity duration-200 ${isSearchOpen ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : 'opacity-100'}`}>
                                    <div className='flex flex-col'>
                                        <h2 className="text-sm sm:text-base font-bold text-[#2a3455]">
                                            {targetRequest.title}
                                        </h2>
                                        <p className="text-[10px] sm:text-xs italic text-slate-500">(Please fill in the <strong>Unit Cost</strong> and <strong>Ord. Qty</strong> for each item below.)</p>
                                    </div>

                                    {(orderItems.length > 1 || search) && (
                                        <div className="flex items-center gap-1 sm:hidden">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-card border rounded-lg" onClick={() => setIsSearchOpen(true)}>
                                                <Search className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {(orderItems.length > 1 || search) && (
                                    <>
                                        {/* Mobile Search Overlay */}
                                        <div
                                            className={`absolute inset-0 z-20 flex items-center gap-1 bg-white sm:hidden transition-all duration-300 origin-right ${isSearchOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 pointer-events-none'}`}
                                        >
                                            <SearchInput
                                                value={search}
                                                onChange={setSearch}
                                                placeholder="Search Material..."
                                                className="flex-1 border-none"
                                                inputClassName="bg-slate-50 shadow-none focus-visible:ring-0"
                                                autoFocus={isSearchOpen}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 shrink-0 text-slate-500 hover:bg-slate-50 mr-1"
                                                onClick={() => setIsSearchOpen(false)}
                                            >
                                                <X className="h-5 w-5" />
                                                <span className="sr-only">Close search</span>
                                            </Button>
                                        </div>

                                        {/* Desktop Search */}
                                        <div className="hidden sm:flex w-full sm:w-auto flex-col sm:flex-row gap-3">
                                            <SearchInput
                                                value={search}
                                                onChange={setSearch}
                                                placeholder="Search Material..."
                                                className="flex-1 lg:min-w-[300px]"
                                                inputClassName="bg-white"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:block overflow-x-auto space-y-4">
                            <DataTable
                                data={filteredItems}
                                columns={columns}
                                keyExtractor={(item) => item.id}
                                className="border-0 rounded-none mb-0"
                                headerClassName="bg-[#2a3455]/10"
                                footer={
                                    <div className="bg-slate-50/50 px-4 py-2 text-right text-sm sm:text-base font-semibold text-slate-900 tracking-wider border-t border-slate-200">
                                        Total:
                                        <span className="ps-2 text-lg font-bold font-mono text-[#2a3455] tracking-tighter">{formatCurrency(totalPOValue)}</span>
                                    </div>
                                }
                            />
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {filteredItems.length === 0 ? (
                                <EmptyState
                                    icon={ShoppingCart}
                                    title="No items found"
                                    description="Try adjusting your search."
                                    className="py-8"
                                />
                            ) : (
                                filteredItems.map(item => (
                                    <POFormItemCard
                                        key={item.id}
                                        item={item}
                                        onUpdate={handleItemChange}
                                        isUpdateMode={isUpdateMode}
                                    />
                                ))
                            )}
                        </div>

                    </CardContent>
                </Card>

                {/* Aside - Notes & Actions */}
                <div className="order-2 lg:col-span-1 space-y-6">
                    <Card className="border border-slate-200 shadow-sm">
                        <CardContent className="p-3 space-y-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="w-full border-b border-slate-300 my-2"></div>
                                <Textarea
                                    placeholder="Additional notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[120px] resize-none bg-slate-50 border-slate-200 focus:border-indigo-500 text-sm"
                                />
                            </div>

                            <div className="flex sm:hidden justify-between items-center py-2 border-t border-slate-100 mt-2">
                                <span className="text-base font-semibold text-slate-700">Total Amount:</span>
                                <span className="text-xl font-bold font-mono text-[#2a3455] tracking-tighter">
                                    {formatCurrency(totalPOValue)}
                                </span>
                            </div>

                            <div className="pt-2 space-y-3 flex justify-between gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-200 mb-0 text-slate-600 bg-slate-100 hover:bg-slate-50 hover:text-slate-900"
                                    onClick={() => isUpdateMode ? navigateRole(`/procurement/purchase-orders/${id}`) : navigateRole('/procurement/approved-requests')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="w-full bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-lg shadow-indigo-900/10 text-base"
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : null}
                                    {isUpdateMode ? 'Update Order' : 'Create Order'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderForm;
