import { useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { AccountantDashboardData } from '@/hooks/queries/useDashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type DashboardAlert = AccountantDashboardData['alerts'][0];

const MAX_VISIBLE = 3;

interface DashboardAlertsProps {
    alerts: DashboardAlert[];
}

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'budget': return TrendingUp;
        case 'delivery': return Clock;
        case 'system': return CheckCircle;
        default: return AlertTriangle;
    }
};

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
    const [expanded, setExpanded] = useState(false);

    const displayed = expanded ? alerts : alerts.slice(0, MAX_VISIBLE);
    const hiddenCount = alerts.length - MAX_VISIBLE;

    return (
        <Card className="flex flex-col shadow-sm border border-slate-200">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                    Alerts & Flags
                    {alerts.length > 0 && (
                        <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                            {alerts.length}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="divide-y divide-slate-100">
                    {alerts.length > 0 ? (
                        <>
                            {displayed.map((alert, index) => {
                                const IconComponent = getAlertIcon(alert.type);
                                return (
                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${alert.severity === 'danger' ? 'bg-red-500' :
                                                alert.severity === 'warning' ? 'bg-amber-500' :
                                                    'bg-slate-400'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <IconComponent className="h-3 w-3" />
                                                    <span className="capitalize">{alert.type.replace(/_/g, ' ').toLowerCase()}</span>
                                                </span>
                                                {alert.referenceId && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[150px]">Ref #{alert.referenceId}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {hiddenCount > 0 && (
                                <button
                                    className="w-full text-center text-xs text-[#2a3455] font-semibold py-3 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    {expanded ? (
                                        <><ChevronUp className="h-3 w-3" /> Show less</>
                                    ) : (
                                        <><ChevronDown className="h-3 w-3" /> {hiddenCount} more alert{hiddenCount > 1 ? 's' : ''}</>
                                    )}
                                </button>
                            )}
                        </>
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
