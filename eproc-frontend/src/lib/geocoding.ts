

interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Fetches coordinates for a given query using OpenStreetMap Nominatim API.
 * @param query The address or location to search for (e.g., "Msasani, Kinondoni, Dar es Salaam, Tanzania")
 * @returns Promise<Coordinates | null>
 */
export const getCoordinates = async (query: string): Promise<Coordinates | null> => {
    try {
        // Nominatim requires a User-Agent header (browser automatically sets one, but good to be specific if proxying)
        // We use fetch directly here to avoid sending our app's auth tokens to OSM
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en'
            }
        });

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};
