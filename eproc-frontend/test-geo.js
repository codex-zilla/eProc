import { getAllRegions, getDistricts, getWards } from 'tz-geo-data';

console.log('--- Regions Sample ---');
const regions = getAllRegions();
console.log(JSON.stringify(regions.slice(0, 1), null, 2));

if (regions.length > 0) {
    console.log('--- Districts Sample ---');
    const districts = getDistricts(regions[0].name);
    console.log(JSON.stringify(districts.slice(0, 1), null, 2));
    
    if (districts.length > 0) {
        console.log('--- Wards Sample ---');
        const wards = getWards(regions[0].name, districts[0].name);
        console.log(JSON.stringify(wards.slice(0, 1), null, 2));
    }
}
