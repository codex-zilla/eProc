import { Package, CheckCircle, Clock } from 'lucide-react';

interface DeliveryStatsProps {
    stats: {
        total: number;
        fullyDelivered: number;
        partial: number;
        awaiting: number;
    };
}

export const DeliveryStats = ({ stats }: DeliveryStatsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        <p className="text-sm text-slate-500">Total POs</p>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-700">{stats.fullyDelivered}</p>
                        <p className="text-sm text-green-600">Fully Delivered</p>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-700">{stats.partial}</p>
                        <p className="text-sm text-yellow-600">Partial</p>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-700">{stats.awaiting}</p>
                        <p className="text-sm text-blue-600">Awaiting</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
