import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ShoppingCart,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Plus,
    Minus,
    CheckSquare,
    Square,
    Package
} from 'lucide-react';
import { createPurchaseOrder, type CreatePurchaseOrderDTO } from '../../services/procurementService';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

interface MaterialItem {
    id: number;
    requestId: number;
    requestTitle: string;
    materialName: string;
    quantity: number;
    unit: string;
    rateEstimate: number;
    status: string;
    siteName: string;
}

interface RequestResponse {
    id: number;
    title: string;
    status: string;
    siteName: string;
    siteId: number;
    materials?: {
        id: number;
        name: string;
        quantity: number;
        measurementUnit: string;
        rateEstimate: number;
        status: string;
    }[];
}

const CreatePurchaseOrder: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const projectId = searchParams.get('projectId');

    // Determine base path based on user role
    const basePath = user?.role === 'PROJECT_ACCOUNTANT' ? '/accountant' : '/manager';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Map<number, { qty: number; unitPrice: number }>>(new Map());
    const [vendorName, setVendorName] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!projectId) {
            setError('Project ID is required');
            setLoading(false);
            return;
        }
        fetchApprovedRequests();
    }, [projectId]);

    const fetchApprovedRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get<RequestResponse[]>(`/requests/project/${projectId}`);

            // Extract materials from approved/ordered requests
            const approvedMaterials: MaterialItem[] = [];

            for (const request of response.data) {
                // Only include requests that can have POs created
                if (request.status === 'APPROVED' || request.status === 'ORDERED' || request.status === 'PARTIALLY_DELIVERED') {
                    // Safely iterate over materials (may be null/undefined)
                    const requestMaterials = request.materials || [];
                    for (const material of requestMaterials) {
                        // Only include approved materials
                        if (material.status === 'APPROVED') {
                            approvedMaterials.push({
                                id: material.id,
                                requestId: request.id,
                                requestTitle: request.title,
                                materialName: material.name,
                                quantity: material.quantity,
                                unit: material.measurementUnit || 'PCS',
                                rateEstimate: material.rateEstimate || 0,
                                status: material.status,
                                siteName: request.siteName
                            });
                        }
                    }
                }
            }

            setMaterials(approvedMaterials);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch requests:', err);
            setError('Failed to load approved requests');
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (material: MaterialItem) => {
        const newSelected = new Map(selectedItems);
        if (newSelected.has(material.id)) {
            newSelected.delete(material.id);
        } else {
            newSelected.set(material.id, {
                qty: material.quantity,
                unitPrice: material.rateEstimate
            });
        }
        setSelectedItems(newSelected);
    };

    const updateItemQty = (materialId: number, qty: number) => {
        const material = materials.find(m => m.id === materialId);
        if (!material) return;

        const newSelected = new Map(selectedItems);
        const current = newSelected.get(materialId);
        if (current) {
            newSelected.set(materialId, {
                ...current,
                qty: Math.max(1, Math.min(qty, material.quantity))
            });
            setSelectedItems(newSelected);
        }
    };

    const updateItemPrice = (materialId: number, price: number) => {
        const newSelected = new Map(selectedItems);
        const current = newSelected.get(materialId);
        if (current) {
            newSelected.set(materialId, { ...current, unitPrice: Math.max(0, price) });
            setSelectedItems(newSelected);
        }
    };

    const selectAll = () => {
        const newSelected = new Map<number, { qty: number; unitPrice: number }>();
        materials.forEach(m => {
            newSelected.set(m.id, { qty: m.quantity, unitPrice: m.rateEstimate });
        });
        setSelectedItems(newSelected);
    };

    const clearAll = () => {
        setSelectedItems(new Map());
    };

    const calculateTotal = () => {
        let total = 0;
        selectedItems.forEach((item) => {
            total += item.qty * item.unitPrice;
        });
        return total;
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            setError('Please select at least one item');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const items = Array.from(selectedItems.entries()).map(([materialId, item]) => {
                const material = materials.find(m => m.id === materialId)!;
                return {
                    requestId: material.requestId,
                    materialDisplayName: material.materialName,
                    orderedQty: item.qty,
                    unit: material.unit,
                    unitPrice: item.unitPrice
                };
            });

            const dto: CreatePurchaseOrderDTO = {
                projectId: Number(projectId),
                vendorName: vendorName || undefined,
                notes: notes || undefined,
                items
            };

            await createPurchaseOrder(dto);
            navigate(`${basePath}/procurement?projectId=${projectId}`);
        } catch (err: any) {
            console.error('Failed to create PO:', err);
            setError(err.response?.data?.message || 'Failed to create purchase order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`${basePath}/procurement?projectId=${projectId}`)}
                    className="rounded-full p-2 hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                        Create Purchase Order
                    </h1>
                    <p className="text-slate-500">Select approved materials to include in this order</p>
                </div>
            </div>


            {materials.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Approved Materials</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        There are no approved materials ready for ordering. Approve material requests first.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Materials Selection */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-900">Available Materials</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Select All
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-slate-600 hover:text-slate-800"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {materials.map((material) => {
                                const isSelected = selectedItems.has(material.id);
                                const selectedData = selectedItems.get(material.id);

                                return (
                                    <div
                                        key={material.id}
                                        className={`rounded-lg border-2 bg-white p-4 transition-all ${isSelected
                                            ? 'border-indigo-500 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => toggleItem(material)}
                                                className="mt-1 flex-shrink-0"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-slate-400" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-medium text-slate-900">
                                                            {material.materialName}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">
                                                            {material.requestTitle} • {material.siteName}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <p className="text-slate-500">Available</p>
                                                        <p className="font-medium text-slate-900">
                                                            {material.quantity} {material.unit}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isSelected && selectedData && (
                                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                Quantity to Order
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateItemQty(material.id, selectedData.qty - 1)}
                                                                    className="rounded p-1 hover:bg-slate-100"
                                                                >
                                                                    <Minus className="h-4 w-4 text-slate-600" />
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    value={selectedData.qty}
                                                                    onChange={(e) => updateItemQty(material.id, Number(e.target.value))}
                                                                    className="w-20 rounded border border-slate-300 px-2 py-1 text-center text-sm"
                                                                    min={1}
                                                                    max={material.quantity}
                                                                />
                                                                <button
                                                                    onClick={() => updateItemQty(material.id, selectedData.qty + 1)}
                                                                    className="rounded p-1 hover:bg-slate-100"
                                                                >
                                                                    <Plus className="h-4 w-4 text-slate-600" />
                                                                </button>
                                                                <span className="text-sm text-slate-500">{material.unit}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                Unit Price
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={selectedData.unitPrice}
                                                                onChange={(e) => updateItemPrice(material.id, Number(e.target.value))}
                                                                className="w-full rounded border border-slate-300 px-3 py-1 text-sm"
                                                                min={0}
                                                                step={0.01}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Order Summary
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorName}
                                        onChange={(e) => setVendorName(e.target.value)}
                                        placeholder="Enter vendor name"
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows={3}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Items Selected</span>
                                        <span className="font-medium text-slate-900">{selectedItems.size}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-slate-900">Total</span>
                                        <span className="text-indigo-600">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD'
                                            }).format(calculateTotal())}
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || selectedItems.size === 0}
                                    className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Purchase Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePurchaseOrder;
