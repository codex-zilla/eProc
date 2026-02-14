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
    className,
}) => {
    return (
        <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
            <div className="flex items-center justify-between">
                <div>
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
                </div>
                <div
                    className={cn(
                        'p-3 rounded-full',
                        colorClasses[color]
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
};
