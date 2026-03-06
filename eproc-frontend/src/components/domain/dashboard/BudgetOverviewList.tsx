import React, { useState } from 'react';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export interface BudgetOverviewProject {
    projectId: number;
    projectName: string;
    currency: string;
    budgetTotal: number;
    committedAmount: number;
    utilizationPct: number;
}

interface BudgetOverviewListProps {
    data: BudgetOverviewProject[];
    title?: string;
    maxRows?: number; // default 5
}

export const BudgetOverviewList: React.FC<BudgetOverviewListProps> = ({ data, title, maxRows = 5 }) => {
    const navigateRole = useRoleNavigate();
    const [showAll, setShowAll] = useState(false);

    const displayed = showAll ? data : data.slice(0, maxRows);
    const hiddenCount = data.length - maxRows;

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">{title || "Budget Overview"}</h2>
                {data.length > 0 && (
                    <button
                        className="text-xs text-[#2a3455] font-semibold flex items-center gap-1 hover:underline"
                        onClick={() => navigateRole('/projects')}
                    >
                        All projects <ArrowRight className="h-3 w-3" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-5">
                {data && data.length > 0 ? (
                    <>
                        {displayed.map((project) => {
                            const isOverspent = project.utilizationPct > 100;
                            const isNearBudget = project.utilizationPct >= 80 && project.utilizationPct <= 100;
                            let progressColorClass = 'bg-[#2a3455]';
                            if (isOverspent) progressColorClass = 'bg-red-600';
                            else if (isNearBudget) progressColorClass = 'bg-yellow-500';

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
                        })}

                        {!showAll && hiddenCount > 0 && (
                            <button
                                className="w-full text-center text-xs text-[#2a3455] font-semibold py-2 hover:bg-slate-50 rounded transition-colors border border-slate-200"
                                onClick={() => setShowAll(true)}
                            >
                                + {hiddenCount} more project{hiddenCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        No active project budgets found
                    </div>
                )}
            </div>
        </div>
    );
};
