declare module 'tz-geo-data' {
    export interface Region {
        region: string;
        postcode: number;
    }

    export interface District {
        name: string;
        postcode: number;
    }

    export interface Ward {
        name: string;
        postcode: number;
    }

    export function getAllRegions(): Region[];
    export function getDistrictData(regionName: string): District[];
    export function getWardData(regionName: string, districtName: string): Ward[];
}
