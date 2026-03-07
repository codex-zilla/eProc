/**
 * WizardStepTimeline — Step 3: Owner, Timeline & Contract
 * 
 * Owner representative, start/end dates, contract type,
 * defects liability period, performance security.
 * Uses FormField for consistent field rendering.
 */

import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/common/FormField';
import type { ProjectWizardFormData } from '@/types/models';
import { ContractType } from '@/types/models';

interface WizardStepTimelineProps {
    formData: ProjectWizardFormData;
    handleChange: (field: string, value: any) => void;
    fieldErrors: Record<string, string>;
}

export const WizardStepTimeline: React.FC<WizardStepTimelineProps> = ({
    formData,
    handleChange,
    fieldErrors
}) => {
    return (
        <>
            <CardHeader className="p-2 sm:p-4 pb-0 sm:pb-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#2a3455] mb-0">Owner, Timeline & Contract</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Project ownership and scheduling details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                <FormField label="Owner Representative Name">
                    <Input
                        value={formData.ownerRepName}
                        onChange={e => handleChange('ownerRepName', e.target.value)}
                        className="h-9 sm:h-10 text-sm border-[#2a3455]/20"
                    />
                </FormField>

                <FormField label="Owner Rep Contact">
                    <Input
                        value={formData.ownerRepContact}
                        onChange={e => handleChange('ownerRepContact', e.target.value)}
                        placeholder="Phone or email"
                        className="h-9 sm:h-10 text-sm border-[#2a3455]/20"
                    />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Start Date" required error={fieldErrors.startDate}>
                        <Input
                            type="date"
                            value={formData.startDate}
                            onChange={e => handleChange('startDate', e.target.value)}
                            className={`h-9 sm:h-10 text-sm border-[#2a3455]/20 ${fieldErrors.startDate ? 'border-red-500' : ''}`}
                        />
                    </FormField>

                    <FormField label="Expected Completion" required error={fieldErrors.expectedCompletionDate}>
                        <Input
                            type="date"
                            value={formData.expectedCompletionDate}
                            onChange={e => handleChange('expectedCompletionDate', e.target.value)}
                            className={`h-9 sm:h-10 text-sm border-[#2a3455]/20 ${fieldErrors.expectedCompletionDate ? 'border-red-500' : ''}`}
                        />
                    </FormField>
                </div>

                <hr className="my-3 sm:my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Contract Type">
                        <Select value={formData.contractType} onValueChange={v => handleChange('contractType', v)}>
                            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20">
                                <SelectValue placeholder="Select Contract Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(ContractType).map(t => (
                                    <SelectItem key={t} value={t} className="text-xs sm:text-sm">{t.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Defects Liability Period (Days)">
                        <Input
                            type="number"
                            value={formData.defectsLiabilityPeriod}
                            onChange={e => handleChange('defectsLiabilityPeriod', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="h-9 sm:h-10 text-sm border-[#2a3455]/20"
                        />
                    </FormField>
                </div>

                {/* Performance Security Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="perfSecurity"
                        checked={formData.performanceSecurityRequired}
                        onCheckedChange={(v) => handleChange('performanceSecurityRequired', v === true)}
                    />
                    <Label htmlFor="perfSecurity" className="text-xs sm:text-sm font-normal cursor-pointer">Performance Security Required?</Label>
                </div>
            </CardContent>
        </>
    );
};
