/**
 * WizardStepContext — Step 4: Project Context
 * 
 * Key objectives and expected output text areas.
 * Uses FormField for consistent field rendering.
 */

import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import type { ProjectWizardFormData } from '@/types/models';

interface WizardStepContextProps {
    formData: ProjectWizardFormData;
    handleChange: (field: string, value: any) => void;
    fieldErrors: Record<string, string>;
}

export const WizardStepContext: React.FC<WizardStepContextProps> = ({
    formData,
    handleChange,
}) => {
    return (
        <>
            <CardHeader className="p-2 sm:p-4 pb-0 sm:pb-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#2a3455] mb-0">Project Context</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Objectives and Outputs (Scope definition comes later)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                <FormField label="Key Objectives">
                    <Textarea
                        value={formData.keyObjectives}
                        onChange={e => handleChange('keyObjectives', e.target.value)}
                        placeholder="Main goals and objectives of the project..."
                        className="resize-none h-24 sm:h-28 text-sm border-[#2a3455]/20"
                    />
                </FormField>

                <FormField label="Expected Output">
                    <Textarea
                        value={formData.expectedOutput}
                        onChange={e => handleChange('expectedOutput', e.target.value)}
                        placeholder="Expected deliverables and outcomes..."
                        className="resize-none h-24 sm:h-28 text-sm border-[#2a3455]/20"
                    />
                </FormField>
            </CardContent>
        </>
    );
};
