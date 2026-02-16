import { AlertOctagon, ArrowDown, Activity } from 'lucide-react';

interface PriorityBadgeProps {
    priority: string;
    className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
    if (!priority) return null;

    const getPriorityConfig = (p: string) => {
        switch (p) {
            case 'HIGH':
                return {
                    icon: <AlertOctagon className="h-3 w-3" />,
                    color: 'text-red-700',
                    bg: 'bg-red-50'
                };
            case 'MEDIUM':
                return {
                    icon: <Activity className="h-3 w-3" />,
                    color: 'text-amber-700',
                    bg: 'bg-amber-50'
                };
            case 'LOW':
                return {
                    icon: <ArrowDown className="h-3 w-3" />,
                    color: 'text-slate-600',
                    bg: 'bg-slate-50'
                };
            default:
                return {
                    icon: null,
                    color: 'text-slate-600',
                    bg: 'bg-slate-50'
                };
        }
    };

    const config = getPriorityConfig(priority);

    return (
        <div className={`flex items-center gap-1 text-[10px] lg:text-xs font-medium ${config.color} ${className}`}>
            {config.icon}
            {priority}
        </div>
    );
};
