import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { ManagerDashboardData } from "@/hooks/queries/useDashboard";

interface UpcomingMilestonesWidgetProps {
    milestones: ManagerDashboardData["upcomingMilestones"];
}

export function UpcomingMilestonesWidget({ milestones }: UpcomingMilestonesWidgetProps) {
    if (!milestones?.length) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 sm:p-5">
                    <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-indigo-500" />
                        Upcoming Milestones
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 text-center text-sm text-slate-500">
                    No upcoming milestones found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="p-4 sm:p-5 pb-2 border-b border-slate-100 flex-none">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-indigo-500" />
                    Upcoming Milestones
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-100">
                    {milestones.map((m) => (
                        <li key={m.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 overflow-hidden min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                        {m.title}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        {m.projectName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {m.isOverdue && (
                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={`text-[10px] sm:text-xs font-medium ${m.isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                            {m.dueDate ? format(new Date(m.dueDate), "MMM d, yyyy") : "No date"}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant={m.isOverdue ? "destructive" : "secondary"} className="shrink-0 text-[10px] sm:text-xs">
                                    {m.isOverdue ? "Overdue" : m.status}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
