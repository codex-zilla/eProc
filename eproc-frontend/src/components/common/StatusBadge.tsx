import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    type ProjectStatus,
    type RequestStatus,
    type POStatus,
    getProjectStatusClass,
    getRequestStatusClass,
    getPOStatusClass,
    getRequestStatusLabel
} from '@/lib/status-utils';

export type StatusType = 'project' | 'request' | 'po' | 'default';

interface StatusBadgeProps {
    status: string;
    type?: StatusType;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default', className }) => {
    let statusClass = 'bg-slate-100 text-slate-800 border-slate-200';
    let label = status;

    switch (type) {
        case 'project':
            statusClass = getProjectStatusClass(status as ProjectStatus);
            label = status.toLowerCase(); // Projects usually show lowercase in UI based on Projects.tsx
            break;
        case 'request':
            statusClass = getRequestStatusClass(status as RequestStatus);
            label = getRequestStatusLabel(status as RequestStatus);
            break;
        case 'po':
            statusClass = getPOStatusClass(status as POStatus);
            break;
        default:
            break;
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                statusClass,
                "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border shadow-none",
                className
            )}
        >
            {label}
        </Badge>
    );
};
