import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Package,
    Loader2,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Truck,
    ClipboardCheck
} from 'lucide-react';
import {
    getPurchaseOrder,
    recordDelivery,
    getDeliveriesForPO,
    type PurchaseOrderResponse,
    type DeliveryResponse,
    type CreateDeliveryDTO
} from '../../services/procurementService';

interface DeliveryItemInput {
    purchaseOrderItemId: number;
    materialName: string;
    orderedQty: number;
    unit: string;
    totalDelivered: number;
    remaining: number;
    quantityToReceive: number;
    condition: 'GOOD' | 'DAMAGED' | 'PARTIAL_DAMAGE' | 'OTHER';
    notes: string;
}

const DeliveryRegistration: React.FC = () => {
    const { poId } = useParams<{ poId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get('projectId');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderResponse | null>(null);
    const [deliveryHistory, setDeliveryHistory] = useState<DeliveryResponse[]>([]);
    const [deliveryItems, setDeliveryItems] = useState<DeliveryItemInput[]>([]);
    const [deliveryNotes, setDeliveryNotes] = useState('');

    useEffect(() => {
        if (!poId) {
            setError('Purchase Order ID is required');
            setLoading(false);
            return;
        }
        fetchPurchaseOrder();
    }, [poId]);

    const fetchPurchaseOrder = async () => {
        try {
            setLoading(true);
            const [po, deliveries] = await Promise.all([
                getPurchaseOrder(Number(poId)),
                getDeliveriesForPO(Number(poId))
            ]);

            setPurchaseOrder(po);
            setDeliveryHistory(deliveries);

            // Initialize delivery items
            const items: DeliveryItemInput[] = po.items.map(item => ({
                purchaseOrderItemId: item.id,
                materialName: item.materialDisplayName,
                orderedQty: item.orderedQty,
                unit: item.unit,
                totalDelivered: item.totalDelivered,
                remaining: item.orderedQty - item.totalDelivered,
                quantityToReceive: 0,
                condition: 'GOOD',
                notes: ''
            }));

            setDeliveryItems(items);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch PO:', err);
            setError(err.response?.data?.message || 'Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    const updateItemQuantity = (index: number, qty: number) => {
        const newItems = [...deliveryItems];
        const item = newItems[index];
        newItems[index] = {
            ...item,
            quantityToReceive: Math.max(0, Math.min(qty, item.remaining))
        };
        setDeliveryItems(newItems);
    };

    const updateItemCondition = (index: number, condition: DeliveryItemInput['condition']) => {
        const newItems = [...deliveryItems];
        newItems[index] = { ...newItems[index], condition };
        setDeliveryItems(newItems);
    };

    const updateItemNotes = (index: number, notes: string) => {
        const newItems = [...deliveryItems];
        newItems[index] = { ...newItems[index], notes };
        setDeliveryItems(newItems);
    };

    const receiveAll = () => {
        const newItems = deliveryItems.map(item => ({
            ...item,
            quantityToReceive: item.remaining
        }));
        setDeliveryItems(newItems);
    };

    const hasItemsToReceive = deliveryItems.some(item => item.quantityToReceive > 0);

    const handleSubmit = async () => {
        const itemsToSubmit = deliveryItems.filter(item => item.quantityToReceive > 0);

        if (itemsToSubmit.length === 0) {
            setError('Please enter quantities for at least one item');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const dto: CreateDeliveryDTO = {
                purchaseOrderId: Number(poId),
                notes: deliveryNotes || undefined,
                items: itemsToSubmit.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    quantityDelivered: item.quantityToReceive,
                    condition: item.condition,
                    notes: item.notes || undefined
                }))
            };

            await recordDelivery(dto);
            setSuccess(true);

            // Redirect after brief delay to show success
            setTimeout(() => {
                navigate(`/engineer/deliveries?projectId=${projectId}`);
            }, 1500);
        } catch (err: any) {
            console.error('Failed to record delivery:', err);
            setError(err.response?.data?.message || 'Failed to record delivery');
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

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Delivery Recorded!</h2>
                <p className="text-slate-500">Redirecting to deliveries list...</p>
            </div>
        );
    }

    if (!purchaseOrder) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                        <p className="text-sm text-red-700">Purchase order not found</p>
                    </div>
                </div>
            </div>
        );
    }

    const isFullyDelivered = purchaseOrder.status === 'CLOSED';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/engineer/deliveries?projectId=${projectId}`)}
                    className="rounded-full p-2 hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                        Receive Delivery
                    </h1>
                    <p className="text-slate-500">
                        {purchaseOrder.poNumber} • {purchaseOrder.vendorName || 'No vendor specified'}
                    </p>
                </div>
                {isFullyDelivered && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Fully Delivered
                    </span>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* PO Summary */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-4 text-sm">
                    <div>
                        <p className="text-slate-500">Project</p>
                        <p className="font-medium text-slate-900">{purchaseOrder.projectName}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Site</p>
                        <p className="font-medium text-slate-900">{purchaseOrder.siteName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Total Value</p>
                        <p className="font-medium text-slate-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(purchaseOrder.totalValue)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-medium text-slate-900">
                            {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {isFullyDelivered ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">All Items Delivered</h3>
                    <p className="text-green-700">This purchase order has been fully delivered.</p>
                </div>
            ) : (
                <>
                    {/* Quick Actions */}
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Items to Receive
                        </h2>
                        <button
                            onClick={receiveAll}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Receive All Remaining
                        </button>
                    </div>

                    {/* Delivery Items */}
                    <div className="space-y-4">
                        {deliveryItems.map((item, index) => (
                            <div
                                key={item.purchaseOrderItemId}
                                className={`rounded-lg border bg-white p-4 transition-all ${item.quantityToReceive > 0
                                        ? 'border-indigo-300 shadow-sm'
                                        : 'border-slate-200'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900">{item.materialName}</h3>
                                        <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
                                            <span>Ordered: {item.orderedQty} {item.unit}</span>
                                            <span>Delivered: {item.totalDelivered} {item.unit}</span>
                                            <span className="font-medium text-indigo-600">
                                                Remaining: {item.remaining} {item.unit}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full bg-green-500 transition-all duration-300"
                                                style={{ width: `${(item.totalDelivered / item.orderedQty) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {item.remaining > 0 && (
                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                    Qty Received
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantityToReceive}
                                                    onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                                                    className="w-24 rounded border border-slate-300 px-3 py-1.5 text-sm text-center"
                                                    min={0}
                                                    max={item.remaining}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                    Condition
                                                </label>
                                                <select
                                                    value={item.condition}
                                                    onChange={(e) => updateItemCondition(index, e.target.value as DeliveryItemInput['condition'])}
                                                    className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                                                >
                                                    <option value="GOOD">Good</option>
                                                    <option value="DAMAGED">Damaged</option>
                                                    <option value="PARTIAL_DAMAGE">Partial Damage</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {item.quantityToReceive > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => updateItemNotes(index, e.target.value)}
                                            placeholder="Any notes about this item..."
                                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Delivery Notes & Submit */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Delivery Notes (Optional)
                                </label>
                                <textarea
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    placeholder="Any general notes about this delivery..."
                                    rows={2}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !hasItemsToReceive}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="h-4 w-4" />
                                        Record Delivery
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delivery History */}
            {deliveryHistory.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Delivery History
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {deliveryHistory.map((delivery) => (
                            <div key={delivery.id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {new Date(delivery.deliveredDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Received by {delivery.receivedByName}
                                        </p>
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {delivery.items.length} item(s)
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {delivery.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{item.materialDisplayName}</span>
                                            <span className="font-medium text-slate-900">
                                                +{item.quantityDelivered}
                                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${item.condition === 'GOOD'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                    {item.condition}
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryRegistration;
