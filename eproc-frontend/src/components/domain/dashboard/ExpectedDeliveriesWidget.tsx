import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package } from "lucide-react";
import { format } from "date-fns";
import type { EngineerDashboardData } from "@/hooks/queries/useDashboard";

interface ExpectedDeliveriesWidgetProps {
    deliveries: EngineerDashboardData["expectedDeliveries"];
}

export function ExpectedDeliveriesWidget({ deliveries }: ExpectedDeliveriesWidgetProps) {
    if (!deliveries?.length) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 sm:p-5 flex-none">
                    <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-emerald-500" />
                        Expected Deliveries (POs)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 text-center text-sm text-slate-500 flex-1">
                    No expected deliveries found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="p-4 sm:p-5 pb-2 border-b border-slate-100 flex-none">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-emerald-500" />
                    Expected Deliveries (POs)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-100">
                    {deliveries.map((delivery) => (
                        <li key={delivery.poId} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 overflow-hidden min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                        PO: {delivery.poNumber}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                                        {delivery.vendorName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Package className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] sm:text-xs font-medium text-slate-500">
                                            {delivery.itemsCount} items
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-medium text-slate-600 mt-1">
                                        {delivery.expectedDate ? format(new Date(delivery.expectedDate), "MMM d, yyyy") : "Date TBD"}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="shrink-0 text-[10px] sm:text-xs bg-slate-100 text-slate-700">
                                    {delivery.status}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
