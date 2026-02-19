import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ShoppingCart, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from '@/context/AuthContext';
import { useProjectRequests } from '@/hooks/queries/useRequests';
import { useCreatePurchaseOrder } from '@/hooks/queries/usePurchaseOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { saveDraft, loadDraft, clearDraft } from '@/lib/utils';
import { isRequired } from '@/lib/validators';
import { LoadingSpinner, ErrorDisplay, EmptyState, DataTable, SearchInput, CreatePOItemMobileCard } from '@/components/common';
import type { RequestMaterial, RequestDetail } from '@/types/models';

interface OrderItem {
    id: number; // materialId
    materialName: string;
    unit: string;
    requestedQty: number;
    orderedQty: number;
    unitPrice: number;
    totalPrice: number;
    code?: string; // Mock code for display
    siteName?: string;
}

interface DraftState {
    vendorName: string;
    notes: string;
    deliveryDate: string;
    items: Record<number, { orderedQty: number; unitPrice: number }>;
    lastSaved: number;
}

const CreatePurchaseOrder = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const projectId = Number(searchParams.get('projectId'));
    const requestId = Number(searchParams.get('requestId'));

    // Determine base path based on user role for back navigation
    const basePath = user?.role === 'ACCOUNTANT' ? '/accountant' : '/manager';

    const { data: requests = [], isLoading: loadingRequests, error: requestsError } = useProjectRequests(projectId || 0);
    const createPOMutation = useCreatePurchaseOrder();

    // Form State
    const [vendorName, setVendorName] = useState('General Vendor'); // Defaulted as requested
    const [notes, setNotes] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [itemsMap, setItemsMap] = useState<Record<number, { orderedQty: number; unitPrice: number }>>({});
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Draft key
    const draftKey = `po_draft_${projectId}_${requestId || 'all'}`;

    // Load Draft on Mount
    const loadedDraftKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (loadedDraftKeyRef.current === draftKey) return;

        const draft = loadDraft<DraftState>(draftKey);
        if (draft) {
            setVendorName(draft.vendorName || 'General Vendor');
            setNotes(draft.notes || '');
            setDeliveryDate(draft.deliveryDate || new Date().toISOString().split('T')[0]);
            setItemsMap(draft.items || {});
            toast.info('Draft loaded successfully');
        }
        loadedDraftKeyRef.current = draftKey;
    }, [draftKey]);

    // Auto-Save Effect
    const debouncedVendor = useDebounce(vendorName, 1000);
    const debouncedNotes = useDebounce(notes, 1000);
    const debouncedDeliveryDate = useDebounce(deliveryDate, 1000);
    const debouncedItems = useDebounce(itemsMap, 1000);

    useEffect(() => {
        if (!projectId) return;

        const draft: DraftState = {
            vendorName: debouncedVendor,
            notes: debouncedNotes,
            deliveryDate: debouncedDeliveryDate,
            items: debouncedItems,
            lastSaved: Date.now()
        };

        saveDraft(draftKey, draft);
    }, [debouncedVendor, debouncedNotes, debouncedDeliveryDate, debouncedItems, draftKey, projectId]);

    // Derived Data
    const targetRequest = useMemo<RequestDetail | null>(() => {
        if (!requests || !requestId) return null;
        return requests.find((r: RequestDetail) => r.id === requestId) || null;
    }, [requests, requestId]);

    const availableMaterials = useMemo(() => {
        if (!targetRequest) return [];
        // Filter for APPROVED materials only
        return (targetRequest.materials || []).filter((m: RequestMaterial) => m.status === 'APPROVED');
    }, [targetRequest]);

    // Compute Table Data
    const orderItems: OrderItem[] = useMemo(() => {
        return availableMaterials.map((material: RequestMaterial) => {
            const state = itemsMap[material.id] || {
                orderedQty: 0, // Default to 0
                unitPrice: material.rateEstimate || 0 // Default to estimated rate
            };

            return {
                id: material.id,
                materialName: material.name,
                unit: material.measurementUnit || 'PCS',
                requestedQty: material.quantity,
                orderedQty: state.orderedQty,
                unitPrice: state.unitPrice,
                totalPrice: state.orderedQty * state.unitPrice,
                code: `MAT-${material.id.toString().padStart(3, '0')}-001`,
                siteName: targetRequest?.siteName
            };
        });
    }, [availableMaterials, itemsMap, targetRequest]);

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

    const handleRemoveItem = (id: number) => {
        handleItemChange(id, 'orderedQty', '0');
        toast.info("Item excluded from PO");
    };

    const handleSubmit = async () => {
        // Validation
        if (!isRequired(vendorName)) {
            // Should not happen with default, but good to keep
            toast.error('Vendor Name is required');
            return;
        }

        if (!targetRequest) return;

        const validItems = orderItems.filter(item => item.orderedQty > 0);
        if (validItems.length === 0) {
            toast.error('At least one item must have a quantity greater than 0');
            return;
        }

        try {
            const dto = {
                projectId,
                requestId,
                siteId: targetRequest.siteId,
                vendorName,
                notes,
                items: validItems.map(item => ({
                    materialDisplayName: item.materialName,
                    orderedQty: item.orderedQty,
                    unit: item.unit,
                    unitPrice: item.unitPrice
                }))
            };

            await createPOMutation.mutateAsync(dto);

            clearDraft(draftKey);
            toast.success('Purchase Order created successfully');
            navigate(`${basePath}/procurement/purchase-orders`);
        } catch (error) {
            console.error('Failed to create PO:', error);
            // Error handling is managed by the mutation hook usually, but consistent logging helps
        }
    };

    // Columns for DataTable
    const columns: any[] = useMemo(() => [
        {
            id: 'material',
            header: 'Material',
            accessorKey: 'materialName',
            cell: (item: OrderItem) => (
                <span className="font-semibold text-slate-900 text-sm">{item.materialName}</span>
            ),
            className: 'pr-0'
        },
        {
            id: 'unit',
            header: 'Unit',
            accessorKey: 'unit',
            className: 'pr-0',
            headerClassName: 'pr-0',
            cell: (item: OrderItem) => (
                <span className='font-semibold text-slate-600'>{item.unit.toLocaleLowerCase()}</span>
            )
        },
        {
            id: 'reqQty',
            header: 'Req. Qty',
            accessorKey: 'requestedQty',
            className: 'font-medium text-slate-700 text-center',
            headerClassName: 'text-center',
            cell: (item: OrderItem) => (
                <span>{item.requestedQty.toLocaleString()}</span>
            )
        },

        {
            id: 'unitPrice',
            header: 'Unit Cost',
            className: ' w-[120px] pr-0',
            headerClassName: 'pr-0',
            cell: (item: OrderItem) => (
                <div className="relative">
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        placeholder="0.00"
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className="w-full font-semibold bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            )
        },
        {
            id: 'orderedQty',
            header: 'Ord. Qty',
            className: 'w-[120px] pr-0',
            headerClassName: 'pr-0',
            cell: (item: OrderItem) => {
                const isPartial = item.orderedQty > 0 && item.orderedQty < item.requestedQty;
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
                            value={item.orderedQty === 0 && item.orderedQty !== item.requestedQty ? '' : item.orderedQty}
                            placeholder="0"
                            onChange={(e) => handleItemChange(item.id, 'orderedQty', e.target.value)}
                            className="w-full font-semibold bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>
                );
            }
        },
        {
            id: 'total',
            header: 'Total',
            className: 'pr-0 min-w-[100px]',
            cell: (item: OrderItem) => (
                <span className="font-semibold text-slate-700 font-mono tracking-tighter">{formatCurrency(item.totalPrice)}</span>
            ),
            headerClassName: 'pr-0'
        },
        {
            id: 'actions',
            header: '',
            cell: (item: OrderItem) => (
                <div className="flex justify-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => handleRemoveItem(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </div>
            ),
            className: 'w-[60px] align-top py-3 pr-2'
        }
    ], [itemsMap, availableMaterials]); // Re-create columns when data changes to update inputs

    if (loadingRequests) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading request details..." />
            </div>
        );
    }

    if (requestsError || !targetRequest) {
        return (
            <ErrorDisplay
                error={requestsError as Error || new Error('Request not found')}
                title="Failed to load request"
                onBack={() => navigate(`${basePath}/procurement/approved-requests`)}
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
                    <Button onClick={() => navigate(`${basePath}/procurement/approved-requests`)}>
                        Return to Approved Requests
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-4 min-w-0 pb-10">
            {/* Header */}
            <Card className='shadow-none bg-transparent border-0'>
                <CardContent className='p-0 sm:p-3'>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-base lg:text-2xl font-bold text-[#2a3455] truncate">Create Purchase Order</h1>
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

                                    <div className="flex items-center gap-1 sm:hidden">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-card border rounded-lg" onClick={() => setIsSearchOpen(true)}>
                                            <Search className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>

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
                                    <CreatePOItemMobileCard
                                        key={item.id}
                                        item={item}
                                        onUpdate={handleItemChange}
                                        onRemove={handleRemoveItem}
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
                                    onClick={() => navigate(`${basePath}/procurement/approved-requests`)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="w-full bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-lg shadow-indigo-900/10 text-base"
                                    onClick={handleSubmit}
                                    disabled={createPOMutation.isPending}
                                >
                                    {createPOMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : null}
                                    Create Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
