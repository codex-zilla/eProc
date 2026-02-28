import type { Site } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { formatNumber, formatGPS } from '@/lib/formatters';

interface SiteCardProps {
    site: Site;
    projectCurrency: string;
    onEdit?: (site: Site) => void;
    onDelete?: (siteId: number) => void;
}

const BuildingGraphic = () => (
    <svg
        width="120"
        height="120"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-8 right-2 opacity-[0.04] z-0 pointer-events-none text-slate-900"
    >
        <path fill="currentColor" d="M10,95 L95,95 L95,45 L70,45 L70,15 L35,15 L35,35 L10,35 Z" />
        <rect fill="white" x="43" y="25" width="8" height="8" />
        <rect fill="white" x="55" y="25" width="8" height="8" />
        <rect fill="white" x="43" y="40" width="8" height="8" />
        <rect fill="white" x="55" y="40" width="8" height="8" />
        <rect fill="white" x="43" y="55" width="8" height="8" />
        <rect fill="white" x="55" y="55" width="8" height="8" />
        <rect fill="white" x="43" y="70" width="8" height="8" />
        <rect fill="white" x="55" y="70" width="8" height="8" />

        <rect fill="white" x="20" y="45" width="8" height="8" />
        <rect fill="white" x="20" y="60" width="8" height="8" />
        <rect fill="white" x="20" y="75" width="8" height="8" />

        <rect fill="white" x="78" y="55" width="8" height="8" />
        <rect fill="white" x="78" y="70" width="8" height="8" />
    </svg>
);

export const SiteCard = ({ site, projectCurrency, onEdit, onDelete }: SiteCardProps) => {
    return (
        <Card className="rounded-sm border-slate-100 flex flex-col h-full relative overflow-hidden group">
            <BuildingGraphic />

            {/* Header Section */}
            <CardHeader className="p-4 pb-0 relative w-full z-10 flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="pr-2 relative min-w-0">
                    <CardTitle className="text-base sm:text-lg font-bold text-[#2a3455] leading-tight mb-1 truncate">
                        {site.name}
                    </CardTitle>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center px-2 py-1 shrink-0 rounded-full border ${site.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${site.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase">{site.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
            </CardHeader>

            {/* Body Section */}
            <CardContent className="flex flex-col flex-1 relative z-10 w-full mb-0 p-4 py-0">
                <div className="flex items-start gap-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 pr-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>{site.location || 'No location set'}</span>
                </div>

                {/* Budget Section */}
                <div className="bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 mb-5 relative z-10 w-full">
                    <span className="text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase block mb-1">Budget Cap</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-600">{projectCurrency}</span>
                        <span className="text-[20px] sm:text-2xl font-bold text-[#1e256e] tracking-tight">{formatNumber(site.budgetCap || 0)}</span>
                    </div>
                </div>

                {/* Coordinates Section */}
                <div className="flex justify-between items-center mb-2 mt-auto relative z-10 gap-2">
                    <span className="text-xs font-medium text-slate-500 shrink-0">Coordinates</span>
                    <div className="bg-slate-100/80 px-3 py-1.5 rounded-full min-w-0">
                        <code className="text-[11px] font-mono text-slate-600 font-medium tracking-wide truncate block">
                            {formatGPS(site.gpsCenter)}
                        </code>
                    </div>
                </div>
            </CardContent>

            {/* Actions Section */}
            {(onEdit || onDelete) && (
                <CardFooter className="flex gap-3 px-4 py-2 pt-3 mt-auto relative z-10">
                    {onEdit && (
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-xl bg-white text-[#2a3455] font-medium border-slate-200 hover:bg-slate-50 hover:text-[#1e256e] shadow-sm transition-all"
                            onClick={() => onEdit(site)}
                        >
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-xl bg-white text-red-600 font-medium border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm transition-all"
                            onClick={() => onDelete(site.id)}
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
};
