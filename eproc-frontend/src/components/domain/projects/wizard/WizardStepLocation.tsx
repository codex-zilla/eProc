/**
 * WizardStepLocation — Step 2: Location Details
 * 
 * Region/District/Ward selects, plot number, title deed checkbox,
 * map picker, site access notes, and work sites management.
 * Uses FormField for consistent field rendering.
 */

import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
import { FormField } from '@/components/common/FormField';
import type { ProjectWizardFormData, WizardSite } from '@/types/models';

interface WizardStepLocationProps {
    formData: ProjectWizardFormData;
    handleChange: (field: string, value: any) => void;
    fieldErrors: Record<string, string>;
    // Location-specific
    mapCenter: { lat: number; lng: number };
    markerPosition: { lat: number; lng: number } | null;
    handleLocationSelect: (lat: number, lng: number) => void;
    regions: any[];
    districts: any[];
    wards: any[];
    // Site handlers
    addSite: () => void;
    removeSite: (index: number) => void;
    updateSite: (index: number, field: string, value: string) => void;
}

export const WizardStepLocation: React.FC<WizardStepLocationProps> = ({
    formData,
    handleChange,
    fieldErrors,
    mapCenter,
    markerPosition,
    handleLocationSelect,
    regions,
    districts,
    wards,
    addSite,
    removeSite,
    updateSite
}) => {
    return (
        <>
            <CardHeader className="p-2 sm:p-4 pb-0 sm:pb-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-[#2a3455] mb-0">Location Details</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Where is the project located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                {/* Region / District / Ward Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <FormField label="Region" required error={fieldErrors.region}>
                        <Select value={formData.region} onValueChange={v => handleChange('region', v)}>
                            <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20 ${fieldErrors.region ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                            <SelectContent>
                                {regions.map((r: any) => (
                                    <SelectItem key={r.region} value={r.region} className="text-xs sm:text-sm">{r.region}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="District" required error={fieldErrors.district}>
                        <Select
                            value={formData.district}
                            onValueChange={v => handleChange('district', v)}
                            disabled={!formData.region || districts.length === 0}
                        >
                            <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20 ${fieldErrors.district ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={!formData.region ? 'Select Region First' : districts.length === 0 ? 'No districts found' : 'Select District'} />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.length === 0 ? (
                                    <SelectItem value="no-districts" disabled className="text-xs sm:text-sm text-muted-foreground">No districts found</SelectItem>
                                ) : (
                                    districts.map((d: any) => (
                                        <SelectItem key={d.name} value={d.name} className="text-xs sm:text-sm">{d.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Ward" required error={fieldErrors.ward} className="sm:col-span-2 lg:col-span-1">
                        <Select
                            value={formData.ward}
                            onValueChange={v => handleChange('ward', v)}
                            disabled={!formData.district || wards.length === 0}
                        >
                            <SelectTrigger className={`h-9 sm:h-10 text-xs sm:text-sm border-[#2a3455]/20 ${fieldErrors.ward ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={!formData.district ? 'Select District First' : wards.length === 0 ? 'No wards found' : 'Select Ward'} />
                            </SelectTrigger>
                            <SelectContent>
                                {wards.length === 0 ? (
                                    <SelectItem value="no-wards" disabled className="text-xs sm:text-sm text-muted-foreground">No wards found</SelectItem>
                                ) : (
                                    wards.map((w: any) => (
                                        <SelectItem key={w.name} value={w.name} className="text-xs sm:text-sm">{w.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                <FormField label="Plot Number">
                    <Input
                        value={formData.plotNumber}
                        onChange={e => handleChange('plotNumber', e.target.value)}
                        className="h-9 sm:h-10 text-sm border-[#2a3455]/20"
                    />
                </FormField>

                {/* Title Deed Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="titleDeed"
                        checked={formData.titleDeedAvailable}
                        onCheckedChange={(v: boolean | 'indeterminate') => handleChange('titleDeedAvailable', v === true)}
                    />
                    <Label htmlFor="titleDeed" className="text-xs sm:text-sm font-normal cursor-pointer">Title Deed Available?</Label>
                </div>

                {/* Map Picker */}
                <div className="grid gap-1.5 sm:gap-2">
                    <Label className="text-xs sm:text-sm font-medium">
                        Pin on Map
                        <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 font-normal">(Click to refine location)</span>
                    </Label>
                    <LocationPicker center={mapCenter} markerPosition={markerPosition} onLocationSelect={handleLocationSelect} />
                    {markerPosition && (
                        <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
                            ✓ Selected: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}
                        </p>
                    )}
                </div>


                {/* Work Sites Section */}
                <div className="">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Work Sites</h3>
                            <p className="text-xs text-muted-foreground">Define sites for this project (at least one).</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addSite} className="text-xs h-8">
                            <Plus className="w-3 h-3 mr-1" /> Add Site
                        </Button>
                    </div>

                    {fieldErrors.overall_sites_budget && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md">
                            {fieldErrors.overall_sites_budget}
                        </div>
                    )}

                    <div className="space-y-3">
                        {formData.initialSites.map((site: WizardSite, index: number) => (
                            <SiteRow
                                key={index}
                                site={site}
                                index={index}
                                canDelete={formData.initialSites.length > 1}
                                onUpdate={updateSite}
                                onRemove={removeSite}
                            />
                        ))}
                    </div>
                </div>

                <FormField label="Site Access Notes">
                    <Textarea
                        value={formData.siteAccessNotes}
                        onChange={e => handleChange('siteAccessNotes', e.target.value)}
                        placeholder="e.g. 4x4 required, muddy road..."
                        className="resize-none h-20 sm:h-24 text-sm border-[#2a3455]/20"
                    />
                </FormField>
            </CardContent>
        </>
    );
};

// ─── Sub-component for a single site row ───

interface SiteRowProps {
    site: WizardSite;
    index: number;
    canDelete: boolean;
    onUpdate: (index: number, field: string, value: string) => void;
    onRemove: (index: number) => void;
}

const SiteRow: React.FC<SiteRowProps> = ({ site, index, canDelete, onUpdate, onRemove }) => (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-100/50">
        <div className="sm:col-span-3 grid gap-1.5">
            <Label className="text-xs">Site Name <span className="text-red-500">*</span></Label>
            <Input
                value={site.name}
                onChange={e => onUpdate(index, 'name', e.target.value)}
                placeholder="e.g. Main Site"
                className="h-8 text-xs"
            />
        </div>
        <div className="sm:col-span-3 grid gap-1.5">
            <Label className="text-xs">Budget Cap (Optional)</Label>
            <Input
                type="number"
                value={site.budgetCap}
                onChange={e => onUpdate(index, 'budgetCap', e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs"
            />
        </div>
        <div className="sm:col-span-5 grid gap-1.5">
            <Label className="text-xs">Location</Label>
            <Input
                value={site.location}
                onChange={e => onUpdate(index, 'location', e.target.value)}
                className="h-8 text-xs"
            />
        </div>
        <div className="sm:col-span-1 flex items-end justify-center pb-0.5">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                disabled={!canDelete}
                className="h-8 w-8 text-gray-400 hover:text-red-600"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    </div>
);
