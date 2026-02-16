import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    XCircle,
    RotateCw,
    AlertCircle
} from 'lucide-react';
import { getRequestStatusClass } from '@/lib/status-utils';

interface RequestStatusBadgeProps {
    status: string;
    className?: string;
}

export const RequestStatusBadge = ({ status, className }: RequestStatusBadgeProps) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-3 w-3 mr-1" />;
            case 'APPROVED': return <CheckCircle className="h-3 w-3 mr-1" />;
            case 'REJECTED': return <XCircle className="h-3 w-3 mr-1" />;
            case 'PARTIALLY_APPROVED': return <RotateCw className="h-3 w-3 mr-1" />;
            case 'SUBMITTED': return <CheckCircle className="h-3 w-3 mr-1" />;
            default: return <AlertCircle className="h-3 w-3 mr-1" />;
        }
    };

    return (
        <Badge className={`${getRequestStatusClass(status as any)} text-[10px] sm:text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 border justify-center ${className}`}>
            {getStatusIcon(status)}
            {status.replace('_', ' ')}
        </Badge>
    );
};
