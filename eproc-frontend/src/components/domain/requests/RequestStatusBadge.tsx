import { Badge } from '@/components/ui/badge';
import { getRequestStatusClass } from '@/lib/status-utils';

interface RequestStatusBadgeProps {
    status: string;
    className?: string;
}

export const RequestStatusBadge = ({ status, className }: RequestStatusBadgeProps) => {
    const label = status.replace(/_/g, ' ');

    return (
        <Badge
            className={`${getRequestStatusClass(status as any)} text-[10px] sm:text-xs px-2.5 py-0.5 whitespace-nowrap flex-shrink-0 font-medium rounded-full border-0 ${className ?? ''}`}
        >
            {label}
        </Badge>
    );
};

