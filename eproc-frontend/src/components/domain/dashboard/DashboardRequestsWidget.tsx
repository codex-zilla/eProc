import { useState } from 'react';
import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { FileText, Clock, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/formatters';
import type { DashboardRequestSummary } from '@/hooks/queries/useDashboard';

interface DashboardRequestsWidgetProps {
    title: string;
    requests: DashboardRequestSummary[];
    actionLabel?: string;
    actionPath: string;        // role-relative path, e.g. '/requests'
    maxRows?: number;          // default 5
    /** Priority status shown at top — 'pending' (manager) or 'processed' (engineer) */
    priority?: 'pending' | 'processed';
}

const getPriorityIcon = (priority?: string) => {
    if (priority === 'pending') return <Clock className="h-4 w-4 mr-2 text-amber-500" />;
    if (priority === 'processed') return <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />;
    return <FileText className="h-4 w-4 mr-2 text-[#2a3455]" />;
};

export function DashboardRequestsWidget({
    title,
    requests,
    actionLabel = 'View All',
    actionPath,
    maxRows = 5,
    priority,
}: DashboardRequestsWidgetProps) {
    const navigateRole = useRoleNavigate();
    const [showAll, setShowAll] = useState(false);

    const displayed = showAll ? requests : requests.slice(0, maxRows);
    const hiddenCount = requests.length - maxRows;

    return (
        <Card className="flex flex-col shadow-sm border border-slate-200">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    {getPriorityIcon(priority)}
                    {title}
                </CardTitle>
                <Button
                    variant="link"
                    className="text-xs h-auto p-0 text-[#2a3455] font-semibold"
                    onClick={() => navigateRole(actionPath)}
                >
                    {actionLabel} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1">
                {displayed.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {displayed.map((req) => (
                            <div
                                key={req.id}
                                className="px-4 py-2 hover:bg-slate-50 transition-colors flex items-start gap-3 group cursor-pointer"
                                onClick={() => navigateRole(`/requests/${req.id}`)}
                            >
                                <div className={`mt-2 flex-shrink-0 w-2 h-2 rounded-full ${req.status === 'PENDING' ? 'bg-amber-500' :
                                    req.status === 'APPROVED' ? 'bg-emerald-500' :
                                        req.status === 'REJECTED' ? 'bg-red-500' :
                                            'bg-slate-400'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{req.title}</p>
                                        <StatusBadge status={req.status} type="request" className="text-[10px] py-0 px-1.5 h-4 min-h-0 flex-shrink-0" />
                                    </div>
                                    <p className="text-xs text-slate-600 truncate">
                                        {req.projectName}{req.siteName ? ` · ${req.siteName}` : ''}
                                    </p>
                                    <div className="flex items-center justify-between mt-0.5 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">{req.createdByName}</span>
                                            <span>•</span>
                                            <span>{formatDate(req.updatedAt || req.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4 text-[#2a3455]" />
                                </div>
                            </div>
                        ))}

                        {!showAll && hiddenCount > 0 && (
                            <button
                                className="w-full text-center text-xs text-[#2a3455] font-semibold py-3 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                onClick={() => setShowAll(true)}
                            >
                                <ChevronDown className="h-3 w-3" /> {hiddenCount} more request{hiddenCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        <EmptyState
                            icon={priority === 'pending' ? Clock : CheckCircle}
                            title={priority === 'pending' ? 'No pending requests' : 'No recent requests'}
                            description={priority === 'pending' ? 'All requests have been reviewed.' : 'Submit your first request to get started.'}
                            className="py-2"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
