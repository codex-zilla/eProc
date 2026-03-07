import React, { useState } from 'react';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { ArrowRight, ChevronDown, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/formatters';
import { getProgressColor } from '@/lib/po-stats';

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
        <Card className="flex flex-col shadow-sm border border-slate-200">
            <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-[#2a3455]" />
                    {title || "Budget Overview"}
                </CardTitle>
                {data.length > 0 && (
                    <Button
                        variant="link"
                        className="text-xs h-auto p-0 text-[#2a3455] font-semibold"
                        onClick={() => navigateRole('/projects')}
                    >
                        All projects <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-0 flex-1">
                {data && data.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {displayed.map((project) => {
                            const progressColorClass = getProgressColor(project.utilizationPct);

                            return (
                                <div key={project.projectId} className="px-4 py-2 space-y-1.5">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-sm text-slate-900 truncate pr-2">
                                            {project.projectName}
                                        </div>
                                        <div className={`text-xs font-semibold whitespace-nowrap ${project.utilizationPct > 100 ? 'text-red-600' : 'text-slate-700'}`}>
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
                                className="w-full text-center text-xs text-[#2a3455] font-semibold py-3 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                onClick={() => setShowAll(true)}
                            >
                                <ChevronDown className="h-3 w-3" /> {hiddenCount} more project{hiddenCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        <EmptyState
                            icon={Wallet}
                            title="No active project budgets"
                            description="Budget data will appear here once projects are active."
                            className="py-2"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
