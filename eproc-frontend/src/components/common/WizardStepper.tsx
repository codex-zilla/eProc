/**
 * WizardStepper Component
 * 
 * Reusable step indicator for multi-step wizard forms.
 * Shows numbered circles with a connecting progress bar.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
    /** The current active step (1-indexed) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Additional className for the wrapper */
    className?: string;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
    currentStep,
    totalSteps,
    className
}) => {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className={cn('relative flex justify-between mb-3 sm:mb-4 px-2 sm:px-6 lg:px-10', className)}>
            {/* Progress Line Track */}
            <div className="absolute top-1/2 left-[24px] right-[24px] sm:left-[44px] sm:right-[44px] lg:left-[64px] lg:right-[64px] h-0.5 bg-gray-300 -translate-y-1/2">
                {/* Progress Line Foreground */}
                <div
                    className="h-full bg-[#2a3455] transition-all duration-500 ease-in-out"
                    style={{ width: `${progressWidth}%` }}
                />
            </div>

            {steps.map(s => (
                <div key={s} className="relative z-10">
                    <div
                        className={cn(
                            'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 text-xs sm:text-sm lg:text-base font-medium transition-all duration-300',
                            currentStep >= s
                                ? 'bg-[#2a3455] border-[#2a3455] text-white shadow-md'
                                : 'border-gray-300 text-gray-400 bg-white'
                        )}
                    >
                        {currentStep > s
                            ? <Check className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            : s
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};
