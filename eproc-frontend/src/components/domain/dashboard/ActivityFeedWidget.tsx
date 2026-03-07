import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Circle, CheckCircle2, Clock, Truck, FileText, AlertCircle } from "lucide-react";
import { EmptyState } from '@/components/common/EmptyState';
import { formatDistanceToNow } from "date-fns";
import type { EngineerDashboardData } from "@/hooks/queries/useDashboard";

interface ActivityFeedWidgetProps {
    activities: EngineerDashboardData["activityFeed"];
}

export function ActivityFeedWidget({ activities }: ActivityFeedWidgetProps) {
    if (!activities?.length) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-[#2a3455]" />
                        Activity Feed
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6">
                        <EmptyState
                            icon={Activity}
                            title="No recent activity"
                            description="Activity will appear here as you work on projects."
                            className="py-2"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getActivityIcon = (type: string, status?: string | null) => {
        if (type === 'REQUEST') {
            if (status === 'APPROVED') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            if (status === 'REJECTED') return <AlertCircle className="w-4 h-4 text-red-500" />;
            return <FileText className="w-4 h-4 text-amber-500" />;
        }
        if (type === 'DELIVERY') return <Truck className="w-4 h-4 text-[#2a3455]" />;
        if (type === 'MILESTONE') return <Clock className="w-4 h-4 text-purple-500" />;
        return <Circle className="w-4 h-4 text-slate-400" />;
    };

    return (
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/50 flex-none">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-[#2a3455]" />
                    Activity Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-100">
                    {activities.map((activity) => (
                        <li key={activity.id} className="px-4 py-2 hover:bg-slate-50 transition-colors">
                            <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0 bg-white border border-slate-100 p-1.5 rounded-full shadow-sm">
                                    {getActivityIcon(activity.type, activity.status)}
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-slate-900">
                                        {activity.title}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2">
                                        {activity.description}
                                    </p>
                                    <p className="text-[10px] text-slate-400 pt-1">
                                        {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : "Unknown time"}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
