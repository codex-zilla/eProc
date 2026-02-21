import { useRoleNavigate } from '@/hooks/useRoleNavigate';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import type { AccountantDashboardData } from '@/hooks/queries/useDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, MobileListCard } from '@/components/common';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/formatters';

export type RecentPO = AccountantDashboardData['recentPOs'][0];

interface RecentPOsWidgetProps {
    recentPOs: RecentPO[];
}

const poColumns: ColumnDef<RecentPO>[] = [
    {
        header: "PO Number",
        cell: (po) => <span className="font-semibold text-[#2a3455] text-xs sm:text-sm">{po.poNumber}</span>,
        className: "pr-0 text-xs sm:text-sm"
    },
    {
        header: "Project",
        accessorKey: "projectName",
        className: "pr-0 text-slate-600 text-xs sm:text-sm"
    },
    {
        header: "Date",
        cell: (po) => <span className="text-slate-500 whitespace-nowrap text-xs sm:text-sm">{new Date(po.updatedAt).toLocaleDateString()}</span>,
        className: "pr-0 hidden lg:table-cell text-xs sm:text-sm",
        headerClassName: "hidden lg:table-cell"
    },
    {
        header: "Amount (TZS)",
        cell: (po) => <span className="font-bold text-slate-800 text-xs sm:text-sm font-mono">{formatCurrency(po.totalValue)}</span>,
        className: "pr-0 text-xs sm:text-sm"
    },
    {
        header: "Status",
        cell: (po) => <StatusBadge status={po.status} type="po" className="text-[10px] sm:text-xs" />,
        className: "pr-0 text-xs sm:text-sm"
    }
];

export function RecentPOsWidget({ recentPOs }: RecentPOsWidgetProps) {
    const navigateRole = useRoleNavigate();

    return (
        <Card className="shadow-sm border border-slate-200">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5 text-indigo-600" />
                    Recent PO Activity
                </CardTitle>
                <Button variant="link" className="text-xs h-auto p-0 text-indigo-600 font-semibold" onClick={(e) => { e.stopPropagation(); navigateRole('/procurement/purchase-orders'); }}>
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="hidden md:block">
                    <DataTable
                        data={recentPOs}
                        columns={poColumns}
                        keyExtractor={(po) => po.id.toString()}
                        onRowClick={(po) => navigateRole(`/procurement/purchase-orders/${po.id}`)}
                        emptyMessage="No purchase orders found"
                        className="border-0 rounded-none shadow-none"
                        headerClassName="bg-slate-50 text-slate-500 font-medium border-b border-slate-100"
                    />
                </div>
                <div className="md:hidden p-4 space-y-3">
                    {recentPOs.length > 0 ? (
                        recentPOs.map(po => (
                            <MobileListCard
                                key={po.id}
                                title={po.poNumber}
                                subtitle={po.projectName}
                                status={<StatusBadge status={po.status} type="po" className="text-[10px]" />}
                                date={po.updatedAt}
                                amount={po.totalValue}
                                onClick={() => navigateRole(`/procurement/purchase-orders/${po.id}`)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-500 text-sm">
                            No purchase orders found
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
