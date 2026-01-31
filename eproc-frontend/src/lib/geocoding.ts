

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
        // Nominatim requires a User-Agent header
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'eProc-App/1.0'
            },
            mode: 'cors'
        });

        if (!response.ok) {
            console.warn(`Geocoding API returned status ${response.status} for query: ${query}`);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        // Silently handle CORS and network errors - geocoding is optional
        console.warn('Geocoding unavailable:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
};
