import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export function PageHeader({ title, description, actions, className, contentClassName }: PageHeaderProps) {
    return (
        <Card className={cn("shadow-none bg-transparent border-0", className)}>
            <CardContent className={cn("p-0 sm:p-1", contentClassName)}>
                <div className="flex flex-row justify-between items-end sm:items-center gap-3 sm:gap-4 lg:gap-6">
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-2xl font-bold tracking-tight text-[#2a3455] truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs sm:text-base text-slate-500 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
