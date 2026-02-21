import { StatCard, type StatCardProps } from './StatCard';
import { cn } from '@/lib/utils';

interface SummaryStatGridProps {
    stats: StatCardProps[];
    className?: string;
}

export function SummaryStatGrid({ stats, className }: SummaryStatGridProps) {
    return (
        <div className={cn("flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pb-1 sm:pb-0 scrollbar-hide snap-x snap-mandatory", className)}>
            <style>{`.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
            {stats.map((stat, index) => (
                <div key={index} className="min-w-[140px] sm:min-w-0 snap-center shrink-0 h-full">
                    <StatCard {...stat} className={cn("h-full hover:shadow-md transition-shadow", stat.className)} />
                </div>
            ))}
        </div>
    );
}
