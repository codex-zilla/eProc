import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { type AccountantDashboardData } from '@/hooks/queries/useDashboard';

interface MonthlySpendChartProps {
    data: AccountantDashboardData['monthlySpend'];
}

export const MonthlySpendChart: React.FC<MonthlySpendChartProps> = ({ data }) => {
    // Format data for recharts
    const chartData = data.map(item => ({
        name: (() => {
            // Convert "YYYY-MM" to "MMM YY" (e.g., "Feb 26")
            try {
                const [year, month] = item.month.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            } catch (e) {
                return item.month;
            }
        })(),
        'Committed Spend': item.committed,
        'Actual Delivered': item.delivered
    }));

    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
        return value.toString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                    <p className="font-semibold text-slate-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-600">{entry.name}:</span>
                            <span className="font-medium text-slate-900">
                                {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-5 h-[350px] flex flex-col">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Monthly Spend Trend</h2>
                <p className="text-sm text-slate-500">Committed vs Actual spending over the last 6 months</p>
            </div>

            {data && data.length > 0 ? (
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatYAxis}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="Committed Spend"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                            <Bar
                                dataKey="Actual Delivered"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <p className="text-sm">No spend data available for the last 6 months</p>
                </div>
            )}
        </div>
    );
};
