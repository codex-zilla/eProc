import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { Package, ArrowRight } from 'lucide-react';
import type { AccountantDashboardData } from '@/hooks/queries/useDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileListCard } from '@/components/common';
import { StatusBadge } from '@/components/common/StatusBadge';

export type RecentRequest = AccountantDashboardData['recentApprovedRequests'][0];

interface RecentRequestsWidgetProps {
    recentRequests: RecentRequest[];
}

export function RecentRequestsWidget({ recentRequests }: RecentRequestsWidgetProps) {
    const navigateRole = useRoleNavigate();

    return (
        <Card className="flex flex-col shadow-sm border border-slate-200">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <Package className="mr-2 h-5 w-5 text-emerald-500" />
                    Recent Approved Requests
                </CardTitle>
                <Button variant="link" className="text-xs h-auto p-0 text-emerald-600 font-semibold" onClick={() => navigateRole('/procurement/requests')}>
                    Process <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <div className="space-y-3">
                    {recentRequests.length > 0 ? (
                        recentRequests.map((req) => (
                            <MobileListCard
                                key={req.id}
                                title={req.title}
                                subtitle={`${req.projectName} - ${req.siteName} (By ${req.createdByName})`}
                                status={<StatusBadge status="APPROVED" type="request" className="text-[10px]" />}
                                date={req.updatedAt}
                                onClick={() => navigateRole(`/procurement/requests/${req.id}`)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No recent approved requests</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
