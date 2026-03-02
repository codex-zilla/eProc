import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface MobileListCardProps {
    title: string;
    /** Small element rendered inline after the title (e.g. a HIGH-priority urgency dot). */
    titleAdornment?: React.ReactNode;
    subtitle?: string;
    /** Icon to show beside the subtitle text. */
    subtitleIcon?: React.ReactNode;
    /** Status badge rendered top-right. */
    status: React.ReactNode;
    date: string | Date;
    /** Pre-formatted amount string. Pass when the default formatCurrency isn't suitable. */
    amountLabel?: string;
    amount?: number;
    onClick?: () => void;
    className?: string;
}

/**
 * Generic mobile card used in list views (projects, requests, etc.).
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────┐
 * │  Title [adornment]       [status]    │
 * │  subtitle icon + text                │
 * ├──────────────────────────────────────┤
 * │  📅 date                   amount    │
 * └──────────────────────────────────────┘
 * ```
 */
export function MobileListCard({
    title,
    titleAdornment,
    subtitle,
    subtitleIcon,
    status,
    date,
    amountLabel,
    amount,
    onClick,
    className,
}: MobileListCardProps) {
    const formattedAmount = amountLabel ?? (amount !== undefined ? formatCurrency(amount) : undefined);

    return (
        <Card
            className={`border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] ${onClick ? 'cursor-pointer' : ''} ${className ?? ''}`}
            onClick={onClick}
        >
            <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1">
                            <h3 className="inline font-bold tracking-tight text-sm text-[#2a3455] align-middle mr-1.5">{title}</h3>
                            {titleAdornment && (
                                <span className="inline-flex align-middle">
                                    {titleAdornment}
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                {subtitleIcon}
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0">{status}</div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(date, 'short')}
                    </div>
                    {formattedAmount !== undefined && (
                        <span className="font-bold text-sm text-slate-900 font-mono">
                            {formattedAmount}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
