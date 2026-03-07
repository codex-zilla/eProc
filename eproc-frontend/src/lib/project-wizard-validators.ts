/**
 * Project Wizard Validation Utilities
 * 
 * Pure functions for step-by-step validation of the project wizard form.
 * Each function returns a Record<string, string> of field errors (empty = valid).
 */

import type { ProjectWizardFormData } from '@/types/models';

/**
 * Step 1: Core Identity — name, industry, projectType required
 */
export function validateIdentityStep(data: ProjectWizardFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
        errors.name = 'Project name is required';
    }
    if (!data.industry) {
        errors.industry = 'Industry selection is required';
    }
    if (!data.projectType) {
        errors.projectType = 'Project type is required';
    }

    return errors;
}

/**
 * Step 2: Location — region, district, ward required
 */
export function validateLocationStep(data: ProjectWizardFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.region) {
        errors.region = 'Region is required';
    }
    if (!data.district) {
        errors.district = 'District is required';
    }
    if (!data.ward) {
        errors.ward = 'Ward is required';
    }

    // Budget Validation
    const projectBudget = parseFloat(data.budgetDisplay) || 0;
    if (projectBudget > 0) {
        let totalSitesBudget = 0;
        data.initialSites.forEach(site => {
            if (site.budgetCap) {
                const b = parseFloat(site.budgetCap);
                if (!isNaN(b)) {
                    totalSitesBudget += b;
                }
            }
        });
        
        if (totalSitesBudget > projectBudget) {
            errors.overall_sites_budget = 'Total budget cap of all sites cannot exceed the general project budget estimate.';
        }
    }

    return errors;
}

/**
 * Step 3: Timeline — startDate, expectedCompletionDate required + date order check
 */
export function validateTimelineStep(data: ProjectWizardFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.startDate) {
        errors.startDate = 'Start date is required';
    }
    if (!data.expectedCompletionDate) {
        errors.expectedCompletionDate = 'Expected completion date is required';
    }
    if (data.startDate && data.expectedCompletionDate) {
        if (new Date(data.startDate) >= new Date(data.expectedCompletionDate)) {
            errors.expectedCompletionDate = 'Completion date must be after start date';
        }
    }

    return errors;
}

/**
 * Composite validator — dispatches to the correct step validator.
 * Returns a Record<string, string> of field errors (empty = valid).
 */
export function validateWizardStep(step: number, data: ProjectWizardFormData): Record<string, string> {
    switch (step) {
        case 1:
            return validateIdentityStep(data);
        case 2:
            return validateLocationStep(data);
        case 3:
            return validateTimelineStep(data);
        default:
            return {};
    }
}
