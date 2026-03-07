/**
 * WizardFooter Component
 * 
 * Reusable footer for multi-step wizard forms.
 * Renders Back / Next / Submit buttons based on current step.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface WizardFooterProps {
    /** Current step (1-indexed) */
    step: number;
    /** Total number of steps */
    totalSteps: number;
    /** Whether the submit action is loading */
    loading: boolean;
    /** Whether the wizard is in edit mode (affects submit button label) */
    isEditMode?: boolean;
    /** Called when user clicks Back */
    onBack: () => void;
    /** Called when user clicks Next */
    onNext: () => void;
    /** Called when user clicks Submit (on last step) */
    onSubmit: () => void;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
    step,
    totalSteps,
    loading,
    isEditMode = false,
    onBack,
    onNext,
    onSubmit
}) => {
    const isLastStep = step >= totalSteps;

    return (
        <CardFooter className="flex flex-row justify-between gap-2 sm:gap-3 p-4 sm:p-6 pt-3 sm:pt-4 border-t">
            {step > 1 ? (
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Back
                </Button>
            ) : (
                <div />
            )}

            <div className="flex-1" />

            {!isLastStep ? (
                <Button
                    className="bg-[#2a3455] hover:bg-[#1e253e] text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm px-3 sm:px-4"
                    onClick={onNext}
                >
                    Next <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
            ) : (
                <Button
                    onClick={onSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-sm px-3 sm:px-4"
                >
                    {loading
                        ? (isEditMode ? 'Saving...' : 'Creating...')
                        : (isEditMode ? 'Save Changes' : 'Create Project')
                    }
                </Button>
            )}
        </CardFooter>
    );
};
