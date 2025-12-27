import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { type LeafletMouseEvent } from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    center?: Location;
    markerPosition?: Location | null;
}

// Subcomponent to handle map clicks
const MapEvents = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to programmatically fly to a new center
const MapController = ({ center }: { center: Location }) => {
    const map = useMap();
    const prevCenter = useRef(center);

    useEffect(() => {
        if (center.lat !== prevCenter.current.lat || center.lng !== prevCenter.current.lng) {
            map.flyTo([center.lat, center.lng], 13, { duration: 1 });
            prevCenter.current = center;
        }
    }, [center, map]);

    return null;
};

// Default center (Dar es Salaam, Tanzania)
const DEFAULT_CENTER = { lat: -6.7924, lng: 39.2083 };

export const LocationPicker = ({ onLocationSelect, center, markerPosition }: LocationPickerProps) => {
    const mapCenter = center || DEFAULT_CENTER;

    const handleSelect = (lat: number, lng: number) => {
        onLocationSelect(lat, lng);
    };

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border border-slate-200 z-0 relative">
            <MapContainer 
                center={[mapCenter.lat, mapCenter.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} />
                <MapEvents onLocationSelect={handleSelect} />
                {markerPosition && <Marker position={[markerPosition.lat, markerPosition.lng]} />}
            </MapContainer>
        </div>
    );
};
