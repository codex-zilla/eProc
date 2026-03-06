/**
 * StatCard Component
 * 
 * Reusable statistics card used throughout dashboards
 * Replaces 50+ inline stat card implementations
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    label: string | React.ReactNode;
    value: React.ReactNode;
    icon?: LucideIcon;
    color?: 'blue' | 'green' | 'amber' | 'slate' | 'red' | 'purple';
    className?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconBgClassName?: string;
    subtitle?: React.ReactNode;
    subtitleClassName?: string;
    children?: React.ReactNode;
}

const colorClasses = {
    blue: 'bg-[#2a3455]/10 text-[#2a3455]',
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
        <div className={cn('bg-white rounded-lg shadow-sm p-4 flex justify-between relative overflow-hidden', className)}>
            <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{value}</h3>
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
                {children && <div className="mt-2 max-w-[120px] sm:max-w-[150px]">{children}</div>}
            </div>
            <div
                className={cn(
                    'absolute -right-2 -bottom-1.5 p-2 opacity-10 sm:self-start sm:opacity-100 sm:relative sm:right-auto sm:bottom-auto sm:p-2 sm:rounded-lg sm:bg-white sm:bg-opacity-60 transition-all shrink-0',
                    iconBgClassName || colorClasses[color]
                )}
            >
                {Icon && <Icon className="h-9 w-9 sm:h-5 sm:w-5" />}
            </div>
        </div>
    );
};