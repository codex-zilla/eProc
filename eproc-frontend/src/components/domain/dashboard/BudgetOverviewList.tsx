import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { type AccountantDashboardData } from '@/hooks/queries/useDashboard';

interface BudgetOverviewListProps {
    data: AccountantDashboardData['budgetOverview'];
}

export const BudgetOverviewList: React.FC<BudgetOverviewListProps> = ({ data }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Budget Overview</h2>
            </div>

            <div className="p-4 space-y-5 max-h-[400px] overflow-y-auto">
                {data && data.length > 0 ? (
                    data.map((project) => {
                        const isOverspent = project.utilizationPct > 100;
                        const isNearBudget = project.utilizationPct >= 80 && project.utilizationPct <= 100;

                        // Determine progress bar color based on utilization
                        let progressColorClass = 'bg-blue-600';
                        if (isOverspent) {
                            progressColorClass = 'bg-red-600';
                        } else if (isNearBudget) {
                            progressColorClass = 'bg-yellow-500';
                        }

                        return (
                            <div key={project.projectId} className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="font-medium text-sm text-slate-900 truncate pr-2">
                                        {project.projectName}
                                    </div>
                                    <div className={`text-xs font-semibold whitespace-nowrap ${isOverspent ? 'text-red-600' : 'text-slate-700'}`}>
                                        {project.utilizationPct.toFixed(1)}%
                                    </div>
                                </div>

                                {/* Progress bar wrapper with custom color injection for the indicator */}
                                <div className="relative">
                                    <Progress value={Math.min(project.utilizationPct, 100)} className="h-2 bg-slate-100 [&>div]:transition-all" style={{ '--progress-color': isOverspent ? '#dc2626' : isNearBudget ? '#eab308' : '#2563eb' } as React.CSSProperties} />
                                    {/* Using standard Radix Progress unfortunately hardcodes background to primary unless overridden with CSS vars or wrapper. Let's use standard Tailwind classes. The above style prop trick requires modifying ui/progress.tsx. Since we don't want to modify ui components, we will build a simple inline progress bar for simplicity and control here */}
                                </div>

                                {/* Fallback to custom progress bar for precise color control if the ui/progress component doesn't take className for the inner div */}
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-in-out ${progressColorClass}`}
                                        style={{ width: `${Math.min(project.utilizationPct, 100)}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{formatCurrency(project.committedAmount)} committed</span>
                                    <span>{formatCurrency(project.budgetTotal)} total</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        No active project budgets found
                    </div>
                )}
            </div>
        </div>
    );
};
