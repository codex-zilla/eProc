import { useState, useEffect } from 'react';
import {
    Download,
    AlertTriangle,
    TrendingDown,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

// Mock data interfaces - replace with actual API calls
interface OrderedVsDelivered {
    materialName: string;
    unit: string;
    orderedQty: number;
    deliveredQty: number;
    remainingQty: number;
    totalValue: number;
}

interface UnderOrderedRequest {
    requestId: number;
    materialName: string;
    requestedQty: number;
    orderedQty: number;
    unit: string;
    projectName: string;
    difference: number;
}

interface DamagedDelivery {
    deliveryId: number;
    poNumber: string;
    materialName: string;
    quantity: number;
    unit: string;
    condition: string;
    deliveryDate: string;
    notes?: string;
}

const AccountantReports = () => {
    const [loading, setLoading] = useState(true);
    const [orderedVsDelivered, setOrderedVsDelivered] = useState<OrderedVsDelivered[]>([]);
    const [underOrdered, setUnderOrdered] = useState<UnderOrderedRequest[]>([]);
    const [damagedDeliveries, setDamagedDeliveries] = useState<DamagedDelivery[]>([]);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual API calls
            // Mock data for demonstration
            setTimeout(() => {
                setOrderedVsDelivered([
                    {
                        materialName: 'Cement (50kg bags)',
                        unit: 'BAG',
                        orderedQty: 500,
                        deliveredQty: 450,
                        remainingQty: 50,
                        totalValue: 25000000
                    },
                    {
                        materialName: 'Steel Reinforcement Bars (12mm)',
                        unit: 'PCS',
                        orderedQty: 300,
                        deliveredQty: 300,
                        remainingQty: 0,
                        totalValue: 18000000
                    },
                    {
                        materialName: 'Aggregate (20mm)',
                        unit: 'TRIP',
                        orderedQty: 25,
                        deliveredQty: 20,
                        remainingQty: 5,
                        totalValue: 7500000
                    }
                ]);

                setUnderOrdered([
                    {
                        requestId: 145,
                        materialName: 'Cement (50kg bags)',
                        requestedQty: 600,
                        orderedQty: 500,
                        unit: 'BAG',
                        projectName: 'Residential Complex A',
                        difference: -100
                    },
                    {
                        requestId: 167,
                        materialName: 'Paint (Interior)',
                        requestedQty: 50,
                        orderedQty: 40,
                        unit: 'LITER',
                        projectName: 'Commercial Building',
                        difference: -10
                    }
                ]);

                setDamagedDeliveries([
                    {
                        deliveryId: 23,
                        poNumber: 'PO-2026-001',
                        materialName: 'Cement (50kg bags)',
                        quantity: 10,
                        unit: 'BAG',
                        condition: 'DAMAGED',
                        deliveryDate: '2026-02-09T14:30:00',
                        notes: 'Water damage during transport'
                    },
                    {
                        deliveryId: 28,
                        poNumber: 'PO-2025-089',
                        materialName: 'Ceramic Tiles',
                        quantity: 5,
                        unit: 'BOX',
                        condition: 'PARTIAL_DAMAGE',
                        deliveryDate: '2026-02-08T11:15:00',
                        notes: 'Some boxes cracked'
                    }
                ]);

                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
            toast.error('Failed to load reports');
            setLoading(false);
        }
    };



    const exportToCSV = (data: any[], filename: string, headers: string[]) => {
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report exported successfully');
    };

    const handleExportOrderedVsDelivered = () => {
        const data = orderedVsDelivered.map(item => ({
            Material: item.materialName,
            Unit: item.unit,
            'Ordered Qty': item.orderedQty,
            'Delivered Qty': item.deliveredQty,
            'Remaining Qty': item.remainingQty,
            'Delivery %': Math.round((item.deliveredQty / item.orderedQty) * 100),
            'Total Value (TZS)': item.totalValue
        }));
        exportToCSV(data, 'ordered_vs_delivered', Object.keys(data[0]));
    };

    const handleExportUnderOrdered = () => {
        const data = underOrdered.map(item => ({
            'Request ID': item.requestId,
            Material: item.materialName,
            Project: item.projectName,
            'Requested Qty': item.requestedQty,
            'Ordered Qty': item.orderedQty,
            Unit: item.unit,
            Difference: item.difference
        }));
        exportToCSV(data, 'under_ordered_requests', Object.keys(data[0]));
    };

    const handleExportDamagedDeliveries = () => {
        const data = damagedDeliveries.map(item => ({
            'Delivery ID': item.deliveryId,
            'PO Number': item.poNumber,
            Material: item.materialName,
            Quantity: item.quantity,
            Unit: item.unit,
            Condition: item.condition,
            'Delivery Date': formatDate(item.deliveryDate),
            Notes: item.notes || ''
        }));
        exportToCSV(data, 'damaged_deliveries', Object.keys(data[0]));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading reports..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-sm text-slate-500 mt-1">Procurement insights and analytics</p>
            </div>

            {/* Ordered vs Delivered Summary */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#2a3455]" />
                        <h2 className="text-lg font-semibold text-slate-900">Ordered vs Delivered Summary</h2>
                    </div>
                    <button
                        onClick={handleExportOrderedVsDelivered}
                        className="px-3 py-1.5 text-sm font-medium text-[#2a3455] bg-[#2a3455]/10 rounded-md hover:bg-[#2a3455]/20 transition-colors"
                    >
                        <Download className="h-4 w-4 inline mr-1" />
                        Export CSV
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Ordered</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Delivered</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Remaining</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {orderedVsDelivered.map((item, index) => {
                                const progress = Math.round((item.deliveredQty / item.orderedQty) * 100);
                                return (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-900">{item.materialName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm text-slate-600">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-slate-700">{item.orderedQty}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-slate-900">{item.deliveredQty}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`text-sm font-medium ${item.remainingQty > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {item.remainingQty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 w-10">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalValue)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-200">
                    {orderedVsDelivered.map((item, index) => {
                        const progress = Math.round((item.deliveredQty / item.orderedQty) * 100);
                        return (
                            <div key={index} className="p-4">
                                <p className="text-sm font-semibold text-slate-900 mb-3">{item.materialName}</p>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <p className="text-xs text-slate-500">Ordered</p>
                                        <p className="font-medium text-slate-900">{item.orderedQty} {item.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Delivered</p>
                                        <p className="font-medium text-slate-900">{item.deliveredQty} {item.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Remaining</p>
                                        <p className={`font-medium ${item.remainingQty > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            {item.remainingQty} {item.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Total Value</p>
                                        <p className="font-semibold text-slate-900">{formatCurrency(item.totalValue)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{progress}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Under-ordered Requests */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-yellow-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Under-ordered Requests</h2>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            {underOrdered.length}
                        </span>
                    </div>
                    <button
                        onClick={handleExportUnderOrdered}
                        className="px-3 py-1.5 text-sm font-medium text-[#2a3455] bg-[#2a3455]/10 rounded-md hover:bg-[#2a3455]/20 transition-colors"
                    >
                        <Download className="h-4 w-4 inline mr-1" />
                        Export CSV
                    </button>
                </div>

                {underOrdered.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {underOrdered.map((item) => (
                            <div key={item.requestId} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{item.materialName}</p>
                                        <p className="text-xs text-slate-600 mt-1">{item.projectName}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span className="text-slate-600">Requested: <span className="font-medium text-slate-900">{item.requestedQty} {item.unit}</span></span>
                                            <span className="text-slate-600">Ordered: <span className="font-medium text-slate-900">{item.orderedQty} {item.unit}</span></span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-300">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {Math.abs(item.difference)} {item.unit} short
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6">
                        <EmptyState
                            icon={TrendingDown}
                            title="No under-ordered requests"
                            description="All requests are within ordered limits."
                        />
                    </div>
                )}
            </div>

            {/* Damaged Deliveries Summary */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Damaged Deliveries</h2>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {damagedDeliveries.length}
                        </span>
                    </div>
                    <button
                        onClick={handleExportDamagedDeliveries}
                        className="px-3 py-1.5 text-sm font-medium text-[#2a3455] bg-[#2a3455]/10 rounded-md hover:bg-[#2a3455]/20 transition-colors"
                    >
                        <Download className="h-4 w-4 inline mr-1" />
                        Export CSV
                    </button>
                </div>

                {damagedDeliveries.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {damagedDeliveries.map((item) => (
                            <div key={item.deliveryId} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{item.materialName}</p>
                                        <p className="text-xs text-slate-600 mt-1">PO: {item.poNumber}</p>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.condition === 'DAMAGED'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.condition.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        Quantity: <span className="font-medium text-slate-900">{item.quantity} {item.unit}</span>
                                    </span>
                                    <span className="text-xs text-slate-500">{formatDate(item.deliveryDate)}</span>
                                </div>
                                {item.notes && (
                                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">{item.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-6">
                        <EmptyState
                            icon={AlertCircle}
                            title="No damaged deliveries"
                            description="No damaged deliveries reported."
                            className="py-6"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountantReports;
