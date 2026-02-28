import type { Site, Project } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GenericModal } from '@/components/common/GenericModal';
import { LocationPicker } from '@/components/ui/location-picker';
import { useSiteForm, type SitePayload } from '@/hooks/useSiteForm';

interface SiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SitePayload) => void;
    editingSite: Site | null;
    project: Project;
    saving: boolean;
}

export const SiteFormModal = ({ isOpen, onClose, onSave, editingSite, project, saving }: SiteFormModalProps) => {
    const {
        formData,
        setFormData,
        markerPosition,
        isGeocoding,
        handleLocationSelect,
        createPayload
    } = useSiteForm(editingSite, isOpen);

    const handleSave = () => {
        if (!formData.name) return;
        const payload = createPayload(project.id);
        onSave(payload);
    };

    const modalFooter = (
        <>
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button className='bg-[#2a3455] hover:bg-[#1e256e]' onClick={handleSave} disabled={saving || !formData.name}>
                {saving ? 'Saving...' : 'Save Site'}
            </Button>
        </>
    );

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingSite ? 'Edit Site' : 'Add New Site'}
            description={editingSite ? 'Update site details below.' : 'Enter details for the new site.'}
            footer={modalFooter}
            maxWidthClass="max-w-lg"
        >
            <div className="space-y-3">
                <div className="grid gap-2">
                    <Label>Site Name <span className="text-red-500">*</span></Label>
                    <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Block A"
                        className='border-[#2a3455]/60 focus:border-[#2a3455]/60'
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Budget Cap ({project.currency})</Label>
                    <Input
                        type="number"
                        value={formData.budgetCap}
                        onChange={e => setFormData({ ...formData, budgetCap: e.target.value })}
                        placeholder="0.00"
                        className='border-[#2a3455]/60 focus:border-[#2a3455]/60'
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="flex justify-between items-center">
                        <span>Location</span>
                        {isGeocoding && <span className="text-xs text-blue-500 animate-pulse">Locating...</span>}
                    </Label>
                    <Input
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Street, Village, Ward, District"
                        className='border-[#2a3455]/60 focus:border-[#2a3455]/60'
                    />
                </div>
                <div className="grid gap-2">
                    <Label>GPS Coordinates</Label>
                    <div className="h-[200px] w-full border rounded-md overflow-hidden relative">
                        <LocationPicker
                            center={markerPosition || { lat: -6.7924, lng: 39.2083 }}
                            markerPosition={markerPosition}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                        {markerPosition ? `${markerPosition.lat.toFixed(6)}, ${markerPosition.lng.toFixed(6)}` : 'No location picked'}
                    </div>
                </div>
            </div>
        </GenericModal>
    );
};
