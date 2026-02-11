import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    FileText,
    Package,
    AlertTriangle,
    CheckCircle,
    Loader2,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getPurchaseOrder, getDeliveriesForPO, type PurchaseOrderResponse, type DeliveryResponse } from '../../services/procurementService';

const PurchaseOrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [po, setPo] = useState<PurchaseOrderResponse | null>(null);
    const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);

    useEffect(() => {
        if (id) {
            fetchPurchaseOrderDetails();
        }
    }, [id]);

    const fetchPurchaseOrderDetails = async () => {
        try {
            setLoading(true);
            const poData = await getPurchaseOrder(Number(id));
            setPo(poData);

            // Fetch deliveries for this PO
            const deliveriesData = await getDeliveriesForPO(Number(id));
            setDeliveries(deliveriesData);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch purchase order details:', error);
            toast.error('Failed to load purchase order details');
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-TZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDeliveryPercentage = (delivered: number, ordered: number) => {
        if (ordered === 0) return 0;
        return Math.min(Math.round((delivered / ordered) * 100), 100);
    };

    const getItemStatus = (item: any) => {
        if (item.fullyDelivered) return 'DELIVERED';
        if (item.totalDelivered > 0) return 'PARTIALLY_DELIVERED';
        return 'ORDERED';
    };

    const handleExportSummary = () => {
        if (!po) return;

        // Generate text summary
        let summary = `PURCHASE ORDER SUMMARY\n`;
        summary += `${'='.repeat(50)}\n\n`;
        summary += `PO Number: ${po.poNumber}\n`;
        summary += `Project: ${po.projectName}\n`;
        summary += `Status: ${po.status}\n`;
        summary += `Created: ${formatDate(po.createdAt)}\n`;
        summary += `Created By: ${po.createdByName}\n`;
        summary += `Total Value: ${formatCurrency(po.totalValue)}\n\n`;

        summary += `ITEMS\n`;
        summary += `${'-'.repeat(50)}\n`;
        po.items.forEach((item, index) => {
            summary += `\n${index + 1}. ${item.materialDisplayName}\n`;
            summary += `   Ordered: ${item.orderedQty} ${item.unit}\n`;
            summary += `   Unit Price: ${formatCurrency(item.unitPrice)}\n`;
            summary += `   Total: ${formatCurrency(item.totalPrice)}\n`;
            summary += `   Delivered: ${item.totalDelivered} ${item.unit} (${calculateDeliveryPercentage(item.totalDelivered, item.orderedQty)}%)\n`;
        });

        // Copy to clipboard
        navigator.clipboard.writeText(summary);
        toast.success('Summary copied to clipboard');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2a3455]" />
            </div>
        );
    }

    if (!po) {
        return (
            <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600">Purchase order not found</p>
                <button
                    onClick={() => navigate('/accountant/purchase-orders')}
                    className="mt-4 text-[#2a3455] hover:text-[#1e253e] font-medium"
                >
                    Back to Purchase Orders
                </button>
            </div>
        );
    }

    // Calculate overall summary
    const totalItems = po.items.length;
    const fullyDeliveredItems = po.items.filter(item => item.fullyDelivered).length;
    const partiallyDeliveredItems = po.items.filter(item => item.totalDelivered > 0 && !item.fullyDelivered).length;
    const overallDeliveryPercentage = Math.round(
        (po.items.reduce((sum, item) => sum + item.totalDelivered, 0) /
            po.items.reduce((sum, item) => sum + item.orderedQty, 0)) * 100
    ) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/accountant/purchase-orders')}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{po.poNumber}</h1>
                        <p className="text-sm text-slate-500 mt-1">{po.projectName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportSummary}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <Download className="h-4 w-4 inline mr-2" />
                        Export Summary
                    </button>
                    <button
                        onClick={() => navigate('/accountant/deliveries')}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#2a3455] rounded-md hover:bg-[#1e253e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2a3455] focus:ring-offset-2"
                    >
                        <Package className="h-4 w-4 inline mr-2" />
                        View Deliveries
                    </button>
                </div>
            </div>

            {/* PO Header Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${po.status === 'OPEN'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                            {po.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Created By</p>
                        <p className="text-sm font-semibold text-slate-900">{po.createdByName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Created Date</p>
                        <p className="text-sm text-slate-700">{formatDate(po.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Value</p>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(po.totalValue)}</p>
                    </div>
                </div>

                {po.vendorName && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Vendor</p>
                        <p className="text-sm text-slate-700">{po.vendorName}</p>
                    </div>
                )}

                {po.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{po.notes}</p>
                    </div>
                )}
            </div>

            {/* Delivery Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Delivery Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-600 mb-1">Total Items</p>
                        <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-green-700 mb-1">Fully Delivered</p>
                        <p className="text-2xl font-bold text-green-900">{fullyDeliveredItems}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-xs text-orange-700 mb-1">Partially Delivered</p>
                        <p className="text-2xl font-bold text-orange-900">{partiallyDeliveredItems}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-700 mb-1">Overall Progress</p>
                        <p className="text-2xl font-bold text-blue-900">{overallDeliveryPercentage}%</p>
                    </div>
                </div>
            </div>

            {/* Ordered Items Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Ordered Items</h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Ordered Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Delivered Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {po.items.map((item) => {
                                const remaining = item.orderedQty - item.totalDelivered;
                                const deliveryPercentage = calculateDeliveryPercentage(item.totalDelivered, item.orderedQty);
                                const status = getItemStatus(item);
                                const isOverDelivered = item.totalDelivered > item.orderedQty;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{item.materialDisplayName}</p>
                                                <p className="text-xs text-slate-500 mt-1">{item.unit}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-slate-700">{item.orderedQty}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium text-slate-900">{item.totalDelivered}</span>
                                                <span className="text-xs text-slate-500">{deliveryPercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`text-sm ${remaining > 0 ? 'text-orange-600 font-medium' : 'text-slate-500'}`}>
                                                {remaining < 0 ? 0 : remaining}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-slate-700">{formatCurrency(item.unitPrice)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status === 'DELIVERED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : status === 'PARTIALLY_DELIVERED'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {status === 'DELIVERED' ? 'DELIVERED' : status === 'PARTIALLY_DELIVERED' ? 'PARTIAL' : 'ORDERED'}
                                                </span>
                                                {isOverDelivered && (
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300"
                                                        title="Delivered quantity exceeds ordered quantity"
                                                    >
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        OVER-DELIVERED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-200">
                    {po.items.map((item) => {
                        const remaining = item.orderedQty - item.totalDelivered;
                        const deliveryPercentage = calculateDeliveryPercentage(item.totalDelivered, item.orderedQty);
                        const status = getItemStatus(item);
                        const isOverDelivered = item.totalDelivered > item.orderedQty;

                        return (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{item.materialDisplayName}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.unit}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${status === 'DELIVERED'
                                            ? 'bg-green-100 text-green-700'
                                            : status === 'PARTIALLY_DELIVERED'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {status === 'DELIVERED' ? 'DELIVERED' : status === 'PARTIALLY_DELIVERED' ? 'PARTIAL' : 'ORDERED'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500">Ordered</p>
                                        <p className="font-medium text-slate-900">{item.orderedQty}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Delivered</p>
                                        <p className="font-medium text-slate-900">{item.totalDelivered} ({deliveryPercentage}%)</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Remaining</p>
                                        <p className={`font-medium ${remaining > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                                            {remaining < 0 ? 0 : remaining}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Total</p>
                                        <p className="font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</p>
                                    </div>
                                </div>

                                {isOverDelivered && (
                                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                        <span>Over-delivered: Delivered qty exceeds ordered qty</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Related Deliveries */}
            {deliveries.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Related Deliveries ({deliveries.length})</h2>
                        <button
                            onClick={() => navigate('/accountant/deliveries')}
                            className="text-sm text-[#2a3455] hover:text-[#1e253e] font-medium flex items-center gap-1"
                        >
                            View All Deliveries
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {deliveries.slice(0, 5).map((delivery) => (
                            <div key={delivery.id} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {delivery.items.length} item{delivery.items.length !== 1 ? 's' : ''} delivered
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Received by {delivery.receivedByName}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500">{formatDate(delivery.deliveredDate)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderDetails;
