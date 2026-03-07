import { useState } from 'react';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, FileText, DollarSign, ArrowRight } from "lucide-react";
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from "@/lib/formatters";
import type { ManagerDashboardData } from "@/hooks/queries/useDashboard";

const MAX_ROWS = 5;

interface SiteActivityWidgetProps {
    siteActivity: ManagerDashboardData["siteActivity"];
}

export function SiteActivityWidget({ siteActivity }: SiteActivityWidgetProps) {
    const navigateRole = useRoleNavigate();
    const [showAll, setShowAll] = useState(false);

    if (!siteActivity?.length) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/50 flex-none">
                    <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-[#2a3455]" />
                        Site Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6">
                        <EmptyState
                            icon={Building2}
                            title="No site activity"
                            description="Site activity data will appear here once projects are active."
                            className="py-2"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayed = showAll ? siteActivity : siteActivity.slice(0, MAX_ROWS);
    const hiddenCount = siteActivity.length - MAX_ROWS;

    return (
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/50 flex-none flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#2a3455]" />
                    Site Activity
                </CardTitle>
                <button
                    className="text-xs text-[#2a3455] font-semibold flex items-center gap-1 hover:underline"
                    onClick={() => navigateRole('/projects')}
                >
                    All sites <ArrowRight className="h-3 w-3" />
                </button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ul className="divide-y divide-slate-100">
                    {displayed.map((site) => (
                        <li key={site.siteId} className="px-4 py-2 sm:p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 overflow-hidden min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                        {site.siteName}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        {site.projectName}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 space-y-1">
                                    <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs font-semibold text-slate-900">
                                        <DollarSign className="w-3 h-3 text-emerald-500" />
                                        {formatCurrency(site.totalSpend, true)}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs font-medium text-slate-500">
                                        <FileText className="w-3 h-3" />
                                        {site.activeRequestsCount} reqs
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {!showAll && hiddenCount > 0 && (
                    <button
                        className="w-full text-center text-xs text-[#2a3455] font-semibold py-3 hover:bg-slate-50 transition-colors border-t border-slate-100"
                        onClick={() => setShowAll(true)}
                    >
                        + {hiddenCount} more site{hiddenCount > 1 ? 's' : ''}
                    </button>
                )}
            </CardContent>
        </Card>
    );
}
