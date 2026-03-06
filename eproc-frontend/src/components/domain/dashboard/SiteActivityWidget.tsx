import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, FileText, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { ManagerDashboardData } from "@/hooks/queries/useDashboard";

interface SiteActivityWidgetProps {
    siteActivity: ManagerDashboardData["siteActivity"];
}

export function SiteActivityWidget({ siteActivity }: SiteActivityWidgetProps) {
    if (!siteActivity?.length) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 sm:p-5 flex-none">
                    <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-[#2a3455]" />
                        Site Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 text-center text-sm text-slate-500 flex-1">
                    No site activity found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="p-4 sm:p-5 pb-2 border-b border-slate-100 flex-none">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                    Site Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-100">
                    {siteActivity.map((site) => (
                        <li key={site.siteId} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
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
            </CardContent>
        </Card>
    );
}
