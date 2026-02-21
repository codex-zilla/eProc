import { AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import type { AccountantDashboardData } from '@/hooks/queries/useDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type DashboardAlert = AccountantDashboardData['alerts'][0];

interface DashboardAlertsProps {
    alerts: DashboardAlert[];
}

// Utility to get the correct icon component based on the alert type
const getAlertIcon = (type: string) => {
    switch (type) {
        case 'budget': return TrendingUp;
        case 'delivery': return Clock;
        case 'system': return CheckCircle;
        default: return AlertTriangle;
    }
};

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
    return (
        <Card className="flex flex-col shadow-sm border border-slate-200">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                    Alerts & Flags
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-100">
                    {alerts.length > 0 ? (
                        alerts.map((alert, index) => {
                            const IconComponent = getAlertIcon(alert.type);
                            return (
                                <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                                    <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${alert.severity === 'danger' ? 'bg-red-500' :
                                        alert.severity === 'warning' ? 'bg-amber-500' :
                                            'bg-slate-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                        <p className="text-xs text-slate-800 mt-0.5">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <IconComponent className="h-3 w-3" />
                                                <span className="capitalize">{alert.type}</span>
                                            </span>
                                            {alert.referenceId && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[150px]">Ref #{alert.referenceId}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        View
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6 text-center text-slate-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                            <p className="text-sm">No active alerts requiring attention.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
