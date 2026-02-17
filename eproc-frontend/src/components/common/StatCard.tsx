/**
 * StatCard Component
 * 
 * Reusable statistics card used throughout dashboards
 * Replaces 50+ inline stat card implementations
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    /** Override icon background with a custom className (e.g. "bg-green-50") */
    iconBgClassName?: string;
    /** Subtitle text rendered below the value */
    subtitle?: string;
    /** Custom className for the subtitle */
    subtitleClassName?: string;
    /** Slot for custom content below the value (e.g. progress bars) */
    children?: React.ReactNode;
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-600',
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    color = 'blue',
    trend,
    iconBgClassName,
    subtitle,
    subtitleClassName,
    children,
    className,
}) => {
    return (
        <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {trend && (
                        <p
                            className={cn(
                                'text-sm mt-2',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                    {subtitle && (
                        <p className={cn('text-xs font-medium mt-1', subtitleClassName)}>
                            {subtitle}
                        </p>
                    )}
                    {children && <div className="mt-2">{children}</div>}
                </div>
                <div
                    className={cn(
                        'p-3 rounded-full shrink-0',
                        iconBgClassName || colorClasses[color]
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
};
