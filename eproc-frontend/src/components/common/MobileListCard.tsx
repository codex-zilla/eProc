
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface MobileListCardProps {
    title: string;
    subtitle?: string;
    status: React.ReactNode;
    date: string | Date;
    amount?: number;
    onClick?: () => void;
    className?: string;
}

export function MobileListCard({
    title,
    subtitle,
    status,
    date,
    amount,
    onClick,
    className
}: MobileListCardProps) {
    return (
        <Card
            className={`border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${className}`}
            onClick={onClick}
        >
            <CardContent className="p-2 sm:p-3">
                <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs sm:text-sm text-[#2a3455]">{title}</h3>
                        {subtitle && <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1">{subtitle}</p>}
                    </div>
                    {status}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(date)}
                    </div>
                    {amount !== undefined && (
                        <span className="font-bold text-sm text-slate-900 font-mono">{formatCurrency(amount)}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
