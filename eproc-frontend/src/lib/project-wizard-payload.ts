/**
 * Project Wizard Payload Builder
 * 
 * Transforms wizard form data into the API-ready payload for create/update.
 * Handles currency conversion and site filtering/mapping.
 */

import type { ProjectWizardFormData } from '@/types/models';
import { convertToTZS } from '@/lib/currency';

interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Builds the API payload from wizard form data.
 * 
 * @param formData - The wizard form state
 * @param markerPosition - The map marker position (null if not set)
 * @param exchangeRate - The current USD→TZS exchange rate
 * @returns The payload object ready for projectService.createProject / updateProject
 */
export function buildProjectPayload(
    formData: ProjectWizardFormData,
    markerPosition: Coordinates | null,
    exchangeRate: number
) {
    const budgetVal = parseFloat(formData.budgetDisplay);
    const budgetInTZS = convertToTZS(isNaN(budgetVal) ? 0 : budgetVal, formData.currency, exchangeRate);

    const gps = markerPosition
        ? `${markerPosition.lat},${markerPosition.lng}`
        : formData.gpsCoordinates;

    return {
        name: formData.name,
        code: formData.code,
        industry: formData.industry,
        projectType: formData.projectType,
        currency: 'TZS',
        budgetTotal: budgetInTZS,

        region: formData.region,
        district: formData.district,
        ward: formData.ward,
        plotNumber: formData.plotNumber,
        gpsCoordinates: gps,
        siteAccessNotes: formData.siteAccessNotes,
        titleDeedAvailable: formData.titleDeedAvailable,
        siteLocation: markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : '',

        ownerRepName: formData.ownerRepName,
        ownerRepContact: formData.ownerRepContact,
        startDate: formData.startDate,
        expectedCompletionDate: formData.expectedCompletionDate,

        contractType: formData.contractType,
        defectsLiabilityPeriod: formData.defectsLiabilityPeriod === '' ? 0 : formData.defectsLiabilityPeriod,
        performanceSecurityRequired: formData.performanceSecurityRequired,
        description: formData.description,

        keyObjectives: formData.keyObjectives,
        expectedOutput: formData.expectedOutput,

        initialSites: formData.initialSites
            .filter(s => s.name)
            .map(s => ({
                id: s.id,
                name: s.name,
                budgetCap: s.budgetCap ? parseFloat(s.budgetCap) : 0,
                location: s.location || `${formData.ward}, ${formData.district}`,
                gpsCenter: s.gpsCenter
            }))
    };
}
