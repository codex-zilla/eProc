/**
 * WizardStepIdentity — Step 1: Core Identity
 * 
 * Project name, code, industry, type, currency, budget, description.
 * Uses FormField for consistent field rendering.
 */

import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';
import type { ProjectWizardFormData } from '@/types/models';
import { Industry, ProjectType } from '@/types/models';

interface WizardStepIdentityProps {
    formData: ProjectWizardFormData;
    handleChange: (field: string, value: any) => void;
    fieldErrors: Record<string, string>;
    exchangeRate: number;
}

export const WizardStepIdentity: React.FC<WizardStepIdentityProps> = ({
    formData,
    handleChange,
    fieldErrors,
    exchangeRate
}) => {
    return (
        <>
            <CardHeader className="p-2 sm:p-4 pb-0 sm:pb-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#2a3455] mb-0">General Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Basic details to identify the project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                <FormField label="Project Name:" required error={fieldErrors.name}>
                    <Input
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="e.g. Skyline Apartments"
                        className={`h-9 sm:h-10 text-sm border-[#2a3455]/20 ${fieldErrors.name ? 'border-red-500' : ''}`}
                    />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Industry" required error={fieldErrors.industry}>
                        <Select value={formData.industry} onValueChange={v => handleChange('industry', v)}>
                            <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20 ${fieldErrors.industry ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Industry).map(i => (
                                    <SelectItem key={i} value={i} className="text-xs sm:text-sm">{i}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Project Type" required error={fieldErrors.projectType}>
                        <Select value={formData.projectType} onValueChange={v => handleChange('projectType', v)}>
                            <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20 ${fieldErrors.projectType ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ProjectType).map(t => (
                                    <SelectItem key={t} value={t} className="text-xs sm:text-sm">{t.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Currency" hint={`Rate: 1 USD ≈ ${exchangeRate.toLocaleString()} TZS`}>
                        <Select value={formData.currency} onValueChange={v => handleChange('currency', v)}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TZS" className="text-xs sm:text-sm">TZS - Tanzanian Shilling</SelectItem>
                                <SelectItem value="USD" className="text-xs sm:text-sm">USD - US Dollar</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Budget Estimate">
                        <Input
                            type="number"
                            value={formData.budgetDisplay}
                            onChange={e => handleChange('budgetDisplay', e.target.value)}
                            placeholder="0.00"
                            className="h-9 sm:h-10 text-sm border-[#2a3455]/20"
                        />
                    </FormField>
                </div>

                <FormField label="Description">
                    <Textarea
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        placeholder="Detailed project description..."
                        className="resize-none h-20 sm:h-24 text-sm border-[#2a3455]/20"
                    />
                </FormField>
            </CardContent>
        </>
    );
};
