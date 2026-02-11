import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Loader2,
    Calendar,
    Edit,
    Printer,
    CheckCircle2,
    Search,
    Filter,
    AlertTriangle,
    ShoppingCart,
    Truck,
    Clock,
    PieChart,
    Package,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { getPurchaseOrder, type PurchaseOrderResponse } from '../../services/procurementService';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PurchaseOrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [po, setPo] = useState<PurchaseOrderResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            year: 'numeric'
        });
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
                <Button
                    variant="link"
                    onClick={() => navigate('/accountant/purchase-orders')}
                    className="mt-4 text-[#2a3455] hover:text-[#1e253e] font-medium"
                >
                    Back to Purchase Orders
                </Button>
            </div>
        );
    }

    const totalOrderedQty = po.items.reduce((sum, item) => sum + item.orderedQty, 0);
    const totalDeliveredQty = po.items.reduce((sum, item) => sum + item.totalDelivered, 0);
    const deliveryPercentage = totalOrderedQty > 0 ? Math.round((totalDeliveredQty / totalOrderedQty) * 100) : 0;
    const pendingItems = po.items.filter(item => item.totalDelivered < item.orderedQty).length;

    const filteredItems = po.items.filter(item =>
        item.materialDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <Card className='shadow-none bg-transparent border-0'>
                <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-lg lg:text-2xl font-bold text-[#2a3455]">Purchase Order: {po.poNumber}</h1>
                                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${po.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                    {po.status}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5 me-3">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span>Project: {po.projectName}</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>Ordered: {formatDate(po.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                <Button variant="outline" size="sm" className="flex-1 lg:flex-none gap-2 px-3 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 lg:flex-none gap-2 px-3 bg-[#2a3455] border-slate-200 text-white hover:bg-[#1e253e]">
                                    <Printer className="h-3.5 w-3.5" />
                                    PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 no-scrollbar snap-x snap-mandatory scrollbar-hide">
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <Card className="sm:min-w-0 snap-center shrink-0">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg shrink-0">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Total Requested Items</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalOrderedQty.toLocaleString()}</h3>
                            <p className="text-xs text-green-600 font-medium mt-1">Unit count</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-[55vw] sm:w-auto sm:min-w-0 snap-center shrink-0">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="p-3 bg-green-50 rounded-lg shrink-0">
                            <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Total Delivered</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalDeliveredQty.toLocaleString()}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1">
                                    <Progress value={deliveryPercentage} className="h-1.5 bg-slate-100 [&>div]:bg-green-500" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">{deliveryPercentage}% Complete</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="sm:min-w-0 snap-center shrink-0">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg shrink-0">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Pending Delivery</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalOrderedQty - totalDeliveredQty}</h3>
                            <p className="text-xs text-amber-600 font-medium mt-1">
                                {pendingItems} items require attention
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-[55vw] sm:w-auto sm:min-w-0  snap-center shrink-0">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg shrink-0">
                            <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Budget Consumed</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">100%</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1">
                                    <Progress value={100} className="h-1.5 bg-slate-100 [&>div]:bg-blue-500" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">On Track</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ordered Items Table Section */}
            <Card className="flex flex-col shadow-none">
                <CardContent className="p-0">
                    <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-[#2a3455]">Ordered Items</h2>
                                <Badge variant="secondary" className="bg-slate-100 py-1 text-slate-600 border-slate-200">
                                    {po.items.length} items
                                </Badge>
                            </div>

                            {/* Mobile Search Toggle (Visible only when search is CLOSED on mobile) */}
                            <div className={`sm:hidden ${isSearchOpen ? 'hidden' : 'block'}`}>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsSearchOpen(true)}>
                                    <Search className="h-5 w-5 text-slate-500" />
                                </Button>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 w-full sm:w-auto transition-all duration-300 ${isSearchOpen ? 'flex-1' : ''}`}>
                            {/* Search Input Container */}
                            <div className={`relative flex-1 sm:min-w-[300px] transition-all duration-300 ${isSearchOpen ? 'block w-full' : 'hidden sm:block'}`}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search Material..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-9 bg-white w-full pr-8"
                                    autoFocus={isSearchOpen}
                                />
                                {isSearchOpen && (
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 sm:hidden z-20"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearchOpen(false);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Actions Buttons (Visible, allowing flex to handle spacing) */}
                            <div className="flex gap-2">
                                <Button variant="outline" className="h-9 gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-3">
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#2a3455]/10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider">Material</TableHead>
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider">Unit Cost</TableHead>
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider text-center">Req. Qty</TableHead>
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider text-center">Ord. Qty</TableHead>
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider">Delivered</TableHead>
                                    <TableHead className="p-3 text-xs font-semibold text-slate-900 uppercase tracking-wider text-center">Remaining</TableHead>
                                    <TableHead className="p-3 pr-0 text-xs font-semibold text-slate-900 uppercase tracking-wider">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map(item => {
                                    const percent = item.orderedQty > 0 ? Math.round((item.totalDelivered / item.orderedQty) * 100) : 0;
                                    const remaining = item.orderedQty - item.totalDelivered;

                                    return (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <TableCell className="p-2 pr-0">
                                                <div className="flex items-start gap-2">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{item.materialDisplayName}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">SKU: {`MAT-${item.id.toString().padStart(4, '0')}`}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-sm font-semibold text-slate-700 font-mono tracking-tight">
                                                {formatCurrency(item.unitPrice)}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-center text-sm font-medium text-slate-700">
                                                {item.orderedQty}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 text-center text-sm font-medium text-slate-700">
                                                {item.orderedQty}
                                            </TableCell>
                                            <TableCell className="p-2 pr-0">
                                                <div className="flex flex-col gap-1.5 max-w-[200px]">
                                                    <div className="flex justify-between text-xs">
                                                        <span className={`font-semibold ${percent === 100 ? 'text-green-600' : 'text-slate-700'}`}>
                                                            {item.totalDelivered} ({percent}%)
                                                        </span>
                                                        {percent === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                                                    </div>
                                                    <div className="h-2 w-full">
                                                        <Progress value={percent} className="h-full bg-slate-100 [&>div]:bg-green-500" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2 mr-3 text-center">
                                                <span className={`text-sm font-medium ${remaining < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {remaining}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-2 pr-0 font-semibold text-slate-700 text-sm font-mono tracking-tight">
                                                {formatCurrency(item.totalPrice)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                            <TableFooter className="bg-slate-50/50">
                                <TableRow>
                                    <TableCell colSpan={7} className="p-2 pe-4 text-right text-sm font-semibold text-slate-900 tracking-wider">
                                        Total:
                                        <span className="ps-2 text-lg font-bold font-mono text-[#2a3455] tracking-tighter">{formatCurrency(po.totalValue)}</span>
                                    </TableCell>

                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-200">
                        {filteredItems.map(item => {
                            const percent = item.orderedQty > 0 ? Math.round((item.totalDelivered / item.orderedQty) * 100) : 0;
                            const remaining = item.orderedQty - item.totalDelivered;
                            const isOverDelivered = item.totalDelivered > item.orderedQty;

                            return (
                                <div key={item.id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">{item.materialDisplayName}</p>
                                            <p className="text-xs text-slate-500 mt-1">SKU: {`MAT-${item.id.toString().padStart(4, '0')}`}</p>
                                        </div>
                                        <Badge variant="secondary" className={`ml-2 ${item.totalDelivered >= item.orderedQty
                                            ? 'bg-green-100 text-green-700'
                                            : item.totalDelivered > 0
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.totalDelivered >= item.orderedQty ? 'DELIVERED' : item.totalDelivered > 0 ? 'PARTIAL' : 'ORDERED'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-500">Ordered</p>
                                            <p className="font-medium text-slate-900">{item.orderedQty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Delivered</p>
                                            <p className="font-medium text-slate-900">{item.totalDelivered} ({percent}%)</p>
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

                    <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{po.items.length}</span> results
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-slate-50 disabled:opacity-50" disabled>
                                <ChevronLeft className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button size="icon" className="h-8 w-8 bg-[#2a3455] text-white hover:bg-[#1e253e]">
                                1
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-slate-50 disabled:opacity-50">
                                <ChevronRight className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PurchaseOrderDetails;

