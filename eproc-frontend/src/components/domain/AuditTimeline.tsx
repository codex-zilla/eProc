interface AuditEntry {
  id: number;
  action: string;
  statusSnapshot?: string;
  comment?: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
}

interface AuditTimelineProps {
  entries: AuditEntry[];
}

/**
 * Reusable audit timeline component for request history.
 */
const AuditTimeline = ({ entries }: AuditTimelineProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return '📝';
      case 'SUBMITTED': return '📤';
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'UPDATED': return '✏️';
      case 'RESUBMITTED': return '🔄';
      default: return '•';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (entries.length === 0) {
    return <p className="text-gray-500">No history available</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
              {getActionIcon(entry.action)}
            </div>
            {index < entries.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{entry.action}</span>
              {entry.statusSnapshot && (
                <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadgeClass(entry.statusSnapshot)}`}>
                  {entry.statusSnapshot}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              by {entry.actorName} ({entry.actorRole})
            </p>
            <p className="text-xs text-gray-400">
              {new Date(entry.timestamp).toLocaleString()}
            </p>
            {entry.comment && (
              <p className="mt-1 text-sm text-gray-600 italic">"{entry.comment}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditTimeline;
