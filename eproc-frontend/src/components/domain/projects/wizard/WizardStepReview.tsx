/**
 * WizardStepReview — Step 5: Review & Submit
 * 
 * Displays a summary of all form data before submission.
 * Uses ReviewItem for consistent label/value rendering.
 */

import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ReviewItem } from '@/components/common/ReviewItem';
import type { ProjectWizardFormData } from '@/types/models';

interface WizardStepReviewProps {
    formData: ProjectWizardFormData;
}

export const WizardStepReview: React.FC<WizardStepReviewProps> = ({ formData }) => {
    const budgetDisplay = formData.budgetDisplay
        ? `${formData.currency} ${parseFloat(formData.budgetDisplay).toLocaleString()}`
        : undefined;

    return (
        <>
            <CardHeader className="p-2 sm:p-4 pb-0 sm:pb-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#2a3455] mb-0">Review & Submit</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Please review your project details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <ReviewItem label="Name" value={formData.name} />
                    <ReviewItem label="Code" value={formData.code} />
                    <ReviewItem label="Industry" value={formData.industry} />
                    <ReviewItem label="Type" value={formData.projectType.replace(/_/g, ' ')} />
                    <ReviewItem label="Region" value={formData.region} />
                    <ReviewItem label="District" value={formData.district} />
                    <ReviewItem label="Ward" value={formData.ward} />
                    <ReviewItem label="Plot" value={formData.plotNumber} />
                    <ReviewItem label="Start Date" value={formData.startDate} />
                    <ReviewItem label="Completion Date" value={formData.expectedCompletionDate} />
                    <ReviewItem label="Contract" value={formData.contractType.replace(/_/g, ' ')} />
                    <ReviewItem label="Budget" value={budgetDisplay} />
                </div>

                {formData.keyObjectives && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1">
                        <p className="font-semibold text-gray-600 text-xs sm:text-sm">Objectives:</p>
                        <p className="text-gray-900 text-xs sm:text-sm">{formData.keyObjectives}</p>
                    </div>
                )}

                {formData.expectedOutput && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-1">
                        <p className="font-semibold text-gray-600 text-xs sm:text-sm">Expected Output:</p>
                        <p className="text-gray-900 text-xs sm:text-sm">{formData.expectedOutput}</p>
                    </div>
                )}
            </CardContent>
        </>
    );
};
