import { useState, useEffect } from 'react';
import type { Site } from '@/types/models';
import { useDebounce } from '@/hooks/useDebounce';

const nominatimUrl = import.meta.env.VITE_NOMINATIM_API_URL;

export interface SiteFormData {
    name: string;
    budgetCap: string;
    location: string;
    gpsCenter: string;
}

export interface SitePayload {
    projectId: number;
    name: string;
    budgetCap: number;
    location: string;
    gpsCenter: string;
}

export const useSiteForm = (editingSite: Site | null, isOpen: boolean) => {
    const [formData, setFormData] = useState<SiteFormData>({
        name: '',
        budgetCap: '',
        location: '',
        gpsCenter: ''
    });
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Debounce the location input to avoid spamming the geocoding API
    const debouncedLocation = useDebounce(formData.location, 1000);

    // Geocode location string into GPS coordinates
    useEffect(() => {
        const fetchCoordinates = async () => {
            // Prevent fetching if it's identical to the loaded editing site's initial location or empty
            if (!debouncedLocation || debouncedLocation.trim().length < 3) return;
            if (editingSite && editingSite.location === debouncedLocation && editingSite.gpsCenter) return;

            setIsGeocoding(true);
            try {
                const res = await fetch(`${nominatimUrl}?q=${encodeURIComponent(debouncedLocation)}&format=json&limit=1`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                        setMarkerPosition({ lat, lng });
                        setFormData(prev => ({ ...prev, gpsCenter: `${lat.toFixed(6)},${lng.toFixed(6)}` }));
                    }
                }
            } catch (error) {
                console.error("Geocoding failed:", error);
            } finally {
                setIsGeocoding(false);
            }
        };

        fetchCoordinates();
    }, [debouncedLocation, editingSite]);

    // Initialize state when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            if (editingSite) {
                setFormData({
                    name: editingSite.name,
                    budgetCap: editingSite.budgetCap?.toString() || '',
                    location: editingSite.location || '',
                    gpsCenter: editingSite.gpsCenter || ''
                });
                if (editingSite.gpsCenter) {
                    const [lat, lng] = editingSite.gpsCenter.split(',').map(s => parseFloat(s.trim()));
                    if (!isNaN(lat) && !isNaN(lng)) setMarkerPosition({ lat, lng });
                    else setMarkerPosition(null);
                } else {
                    setMarkerPosition(null);
                }
            } else {
                setFormData({ name: '', budgetCap: '', location: '', gpsCenter: '' });
                setMarkerPosition(null);
            }
        }
    }, [isOpen, editingSite]);

    const handleLocationSelect = (lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
        setFormData(prev => ({ ...prev, gpsCenter: `${lat.toFixed(6)},${lng.toFixed(6)}` }));
    };

    const createPayload = (projectId: number): SitePayload => ({
        projectId,
        name: formData.name,
        budgetCap: formData.budgetCap ? parseFloat(formData.budgetCap) : 0,
        location: formData.location,
        gpsCenter: markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : formData.gpsCenter
    });

    return {
        formData,
        setFormData,
        markerPosition,
        isGeocoding,
        handleLocationSelect,
        createPayload
    };
};
