import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
    initialLocation?: Location;
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

// Default center (Dar es Salaam, Tanzania)
const DEFAULT_CENTER = { lat: -6.7924, lng: 39.2083 };

export const LocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
    const [position, setPosition] = useState<Location>(initialLocation || DEFAULT_CENTER);
    const [hasSelected, setHasSelected] = useState(!!initialLocation);

    const handleSelect = (lat: number, lng: number) => {
        setPosition({ lat, lng });
        setHasSelected(true);
        onLocationSelect(lat, lng);
    };

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border border-slate-200 z-0 relative">
            <MapContainer 
                center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onLocationSelect={handleSelect} />
                {hasSelected && <Marker position={[position.lat, position.lng]} />}
            </MapContainer>
        </div>
    );
};
