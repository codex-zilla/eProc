import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Calendar, User, Clock, AlertOctagon, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';

export interface RequestMetadataCardProps {
    request: {
        projectName?: string;
        title?: string;
        boqReferenceCode?: string;
        additionalDetails?: string;
        siteName?: string;
        status: string;
        priority?: string;
        plannedStartDate?: string;
        plannedEndDate?: string;
        createdByName?: string;
        createdAt: string;
        totalValue?: number;
        isDuplicateFlagged?: boolean;
        duplicateOfRequestId?: number;
        duplicateOfRequestTitle?: string;
        duplicateExplanation?: string;
        duplicateDetails?: any[];
    };
    pendingCount: number;
}

export const RequestMetadataCard = ({ request, pendingCount }: RequestMetadataCardProps) => {
    const [isDuplicateExpanded, setIsDuplicateExpanded] = useState(false);

    return (
        <Card className="flex flex-col shadow-none border border-slate-200/50">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                    Project: {request.projectName || 'Project Name'}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-2">
                {/* Title */}
                <div className="px-3 pt-1 mb-0 flex flex-row items-center justify-between">
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800 tracking-normal leading-tight">
                        {request.title || request.boqReferenceCode || 'BOQ Request'}
                    </h4>
                    <div className="flex items-center gap-1 tracking-tight">
                        <StatusBadge status={request.status} type="request" className="text-[10px] sm:text-xs px-2.5 py-0.5 font-semibold uppercase" />
                        {request.priority === 'HIGH' && (
                            <Badge variant="destructive" className="text-[10px] sm:text-xs px-2.5 py-0.5 font-semibold">
                                <AlertOctagon className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">HIGH PRIORITY</span>
                                <span className="inline sm:hidden">HIGH</span>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Additional Details */}
                {request.additionalDetails && (
                    <div className="px-3 mb-2">
                        <p className="text-xs sm:text-sm text-slate-600">{request.additionalDetails}</p>
                        {request.siteName && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-2">
                                Site: <span className="font-medium uppercase tracking-tighter text-slate-900">{request.siteName}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Duplicate Warning */}
                {request.isDuplicateFlagged && (
                    <div className="mx-3 mt-1 mb-2 bg-orange-50 border border-orange-200 rounded-md overflow-hidden">
                        <div
                            className="flex items-start gap-2 p-3 cursor-pointer hover:bg-orange-100/50 transition-colors"
                            onClick={() => setIsDuplicateExpanded(!isDuplicateExpanded)}
                        >
                            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-orange-800">Duplicate Request Warning</p>
                                    {isDuplicateExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-orange-600" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-orange-600" />
                                    )}
                                </div>
                                <p className="text-xs text-orange-700 mt-1">
                                    This request was flagged as a potential duplicate of
                                    {request.duplicateOfRequestId ? (
                                        <Link to={`/manager/requests/${request.duplicateOfRequestId}`} className="font-semibold underline ml-1 hover:text-orange-900" onClick={(e) => e.stopPropagation()}>
                                            {request.duplicateOfRequestTitle || `#${request.duplicateOfRequestId}`}
                                        </Link>
                                    ) : ' another request'}.
                                </p>
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        {isDuplicateExpanded && (
                            <div className="px-3 pb-3 pt-0 border-t border-orange-200/50">
                                {/* Comparison Table */}
                                {request.duplicateDetails && request.duplicateDetails.length > 0 && (
                                    <div className="mt-3 overflow-x-auto bg-white/40 rounded border border-orange-100">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-orange-200 bg-orange-100/30">
                                                    <th className="py-1.5 px-2 text-orange-800 font-semibold">Material</th>
                                                    <th className="py-1.5 px-2 text-orange-800 font-semibold">Current Request</th>
                                                    <th className="py-1.5 px-2 text-orange-800 font-semibold">Original Request</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {request.duplicateDetails.map((detail, idx) => (
                                                    <tr key={idx} className="border-b border-orange-100 last:border-0 hover:bg-orange-100/20">
                                                        <td className="py-1.5 px-2 text-orange-900 font-medium">{detail.materialName}</td>
                                                        <td className="py-1.5 px-2 text-orange-800">
                                                            Qty: {detail.currentQuantity}<br />
                                                            <span className="opacity-75 text-[10px]">
                                                                {detail.currentStartDate && detail.currentEndDate ? `${new Date(detail.currentStartDate).toLocaleDateString()} - ${new Date(detail.currentEndDate).toLocaleDateString()}` : 'Dates not set'}
                                                            </span>
                                                        </td>
                                                        <td className="py-1.5 px-2 text-orange-800">
                                                            Qty: {detail.originalQuantity}<br />
                                                            <span className="opacity-75 text-[10px]">
                                                                {detail.originalStartDate && detail.originalEndDate ? `${new Date(detail.originalStartDate).toLocaleDateString()} - ${new Date(detail.originalEndDate).toLocaleDateString()}` : 'Dates not set'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {request.duplicateExplanation && (
                                    <div className="mt-2 bg-white/50 p-2 rounded border border-orange-100">
                                        <p className="text-xs font-semibold text-orange-800 mb-0.5">Engineer's Explanation:</p>
                                        <p className="text-xs text-orange-700 italic">"{request.duplicateExplanation}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Status / Priority Badges */}


                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-1 p-3 pt-1">
                    {[
                        { icon: Calendar, label: 'Starting', value: request.plannedStartDate ? formatDate(request.plannedStartDate) : 'Not specified' },
                        { icon: Calendar, label: 'Ending', value: request.plannedEndDate ? formatDate(request.plannedEndDate) : 'Not specified' },
                        { icon: User, label: 'Requested By', value: request.createdByName || 'Unknown' },
                        { icon: Clock, label: 'Created', value: formatDate(request.createdAt) },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2">
                            <Icon className="h-3.5 w-3.5 text-[#2a3455] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">{label}</p>
                                <p className="text-xs sm:text-sm font-semibold text-[#2a3455]">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Estimate */}
                <div className="border-t border-slate-100 p-3 pt-2">
                    <p className="text-lg sm:text-xl font-bold text-[#2a3455] leading-tight">
                        <span className="text-xs sm:text-sm text-slate-600 font-semibold pr-2">Total Estimate:</span>
                        <span className="font-mono tracking-tighter">{formatCurrency(request.totalValue || 0)}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0 font-semibold">
                        Status:{' '}
                        <span className="font-bold text-yellow-400">
                            {pendingCount} {pendingCount === 1 ? 'Pending Review' : 'Pending Reviews'}
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
