import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RequestDuplicateWarning = () => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex ml-2 align-middle cursor-help">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-xs">Duplicate Material</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
