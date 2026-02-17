
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import type { PurchaseOrder } from '@/types/models';

interface PurchaseOrderMobileCardProps {
    po: PurchaseOrder;
    onClick?: (po: PurchaseOrder) => void;
}

export function PurchaseOrderMobileCard({ po, onClick }: PurchaseOrderMobileCardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(po);
        } else {
            navigate(`/accountant/purchase-orders/${po.id}`);
        }
    };

    return (
        <Card
            className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
            onClick={handleClick}
        >
            <CardContent className="p-3">
                <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-[#2a3455] line-clamp-1">{po.poNumber}</h3>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{po.projectName}</p>
                    </div>
                    <StatusBadge status={po.status} type="po" className="text-[10px] lg:text-xs" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(po.createdAt)}
                    </div>
                    <span className="font-bold text-sm text-slate-900 font-mono">{formatCurrency(po.totalValue)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
