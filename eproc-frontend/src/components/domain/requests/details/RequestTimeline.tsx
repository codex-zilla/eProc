import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Send, CheckCircle, XCircle, Edit, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';

const ActionIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'CREATED': return <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2a3455]" />;
        case 'SUBMITTED': return <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />;
        case 'APPROVED':
        case 'MATERIAL_APPROVED': return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />;
        case 'REJECTED':
        case 'MATERIAL_REJECTED': return <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />;
        case 'UPDATED': return <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />;
        case 'RESUBMITTED': return <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />;
        default: return <div className="h-2 w-2 rounded-full bg-slate-300" />;
    }
};

interface RequestHistoryEntry {
    id: number | string;
    action: string;
    actorName: string;
    timestamp: string;
    comment?: string;
}

interface RequestTimelineProps {
    history: RequestHistoryEntry[];
}

export const RequestTimeline = ({ history }: RequestTimelineProps) => {
    const [expanded, setExpanded] = useState(false);
    const MAX_VISIBLE = 5;

    const displayedHistory = expanded ? history : history.slice(0, MAX_VISIBLE);
    const hiddenCount = history.length - MAX_VISIBLE;

    return (
        <Card className="flex flex-col shadow-none border border-slate-200/50">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                <CardTitle className="text-base font-bold text-[#2a3455] flex items-center mb-0">
                    Request Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                {history.length === 0 ? (
                    <div className="text-center py-6">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs sm:text-base text-slate-500">No history available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayedHistory.map((entry, index) => (
                            <div key={entry.id} className="flex gap-2">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-6 h-6 bg-[#2a3455]/10 rounded-full flex items-center justify-center">
                                        <ActionIcon action={entry.action} />
                                    </div>
                                    {index < displayedHistory.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[16px]" />
                                    )}
                                </div>
                                <div className="flex-1 pb-3 min-w-0">
                                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                                        {entry.action.replace('_', ' ')}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-500">by {entry.actorName}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-400">{formatDateTime(entry.timestamp)}</p>
                                    {entry.comment && (
                                        <p className="mt-1 text-[10px] sm:text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded">
                                            "{entry.comment}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {hiddenCount > 0 && (
                            <button
                                className="w-full text-center text-xs text-[#2a3455] font-semibold py-2 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 rounded"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <><ChevronUp className="h-3 w-3" /> Show less</>
                                ) : (
                                    <><ChevronDown className="h-3 w-3" /> {hiddenCount} more actions</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
