import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';
import { getExchangeRate, convertFromTZS, convertToTZS } from '@/lib/currency';
import { LocationPicker } from '@/components/ui/location-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllRegions, getDistrictData, getWardData } from 'tz-geo-data';
import { getCoordinates } from '@/lib/geocoding';

const CreateProject = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // Financials
    const [displayBudget, setDisplayBudget] = useState('');
    const [currency, setCurrency] = useState('TZS');
    const [exchangeRate, setExchangeRate] = useState<number>(2500);

    // Location
    const [region, setRegion] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>({ lat: -6.7924, lng: 39.2083 });
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);

    // Derived data for cascading selects using tz-geo-data
    const regions = useMemo(() => getAllRegions(), []);
    
    const districts = useMemo(() => {
        if (!region) return [];
        try {
            return getDistrictData(region);
        } catch (e) {
            console.error(e);
            return [];
        }
    }, [region]);

    const wards = useMemo(() => {
        if (!region || !district) return [];
        try {
            return getWardData(region, district);
        } catch (e) {
            console.error(e);
            return [];
        }
    }, [region, district]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initRate = async () => {
            const rate = await getExchangeRate();
            setExchangeRate(rate);
        };
        initRate();
    }, []);

    // Helper to update map from location string
    const updateMapLocation = async (query: string, setMarker: boolean = false) => {
        const coords = await getCoordinates(query);
        if (coords) {
            setMapCenter(coords);
            if (setMarker) {
                setMarkerPosition(coords);
            }
        }
    };

    // Update map center when region changes
    const handleRegionChange = (regionName: string) => {
        setRegion(regionName);
        setDistrict('');
        setWard('');
        setMarkerPosition(null);

        if (regionName) {
            updateMapLocation(`${regionName}, Tanzania`);
        }
    };

    // Update map center when district changes
    const handleDistrictChange = (districtName: string) => {
        setDistrict(districtName);
        setWard('');
        setMarkerPosition(null);

        if (districtName && region) {
            updateMapLocation(`${districtName}, ${region}, Tanzania`);
        }
    };

    // Update map center and marker when ward changes
    const handleWardChange = (wardName: string) => {
        setWard(wardName);

        if (wardName && district && region) {
            updateMapLocation(`${wardName}, ${district}, ${region}, Tanzania`, true);
        }
    };

    const handleCurrencyChange = (newCurrency: string) => {
        if (!displayBudget) {
            setCurrency(newCurrency);
            return;
        }

        const currentAmount = parseFloat(displayBudget);
        if (isNaN(currentAmount)) {
             setCurrency(newCurrency);
             return;
        }

        const amountInTZS = convertToTZS(currentAmount, currency, exchangeRate);
        const newDisplayAmount = convertFromTZS(amountInTZS, newCurrency, exchangeRate);

        setDisplayBudget(newDisplayAmount);
        setCurrency(newCurrency);
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const budgetVal = parseFloat(displayBudget);
            const budgetInTZS = convertToTZS(isNaN(budgetVal) ? 0 : budgetVal, currency, exchangeRate);
            const locString = markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : '';

            await api.post('/projects', {
                name,
                description,
                budgetTotal: budgetInTZS,
                currency: 'TZS',
                region,
                district,
                ward,
                siteLocation: locString
            });
            navigate('/manager/projects');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Section 1: General Info */}
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">1. General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                        <div className="grid gap-1.5 sm:gap-2">
                            <Label htmlFor="name" className="text-xs sm:text-sm">Project Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="e.g., Skyline Tower Renovation"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-9 sm:h-10 text-sm"
                            />
                        </div>
                        <div className="grid gap-1.5 sm:gap-2">
                            <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Scope and objectives..."
                                className="resize-none h-20 sm:h-24 text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Financials */}
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">2. Financials</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="currency" className="text-xs sm:text-sm">Input Currency</Label>
                                <select
                                    id="currency"
                                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                                    value={currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                >
                                    <option value="TZS">TZS - Tanzanian Shilling</option>
                                    <option value="USD">USD - US Dollar</option>
                                </select>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">Values are stored in TZS. Rate: 1 USD ≈ {exchangeRate.toLocaleString()} TZS</p>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="budget" className="text-xs sm:text-sm">Budget Total</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={displayBudget}
                                    onChange={(e) => setDisplayBudget(e.target.value)}
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Location Details */}
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">3. Site Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="region" className="text-xs sm:text-sm">Region</Label>
                                <Select value={region} onValueChange={handleRegionChange}>
                                    <SelectTrigger id="region" className="h-9 sm:h-10 text-xs sm:text-sm">
                                        <SelectValue placeholder="Select Region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map(r => (
                                            <SelectItem key={r.region} value={r.region} className="text-xs sm:text-sm">{r.region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2">
                                <Label htmlFor="district" className="text-xs sm:text-sm">District</Label>
                                <Select value={district} onValueChange={handleDistrictChange} disabled={!region}>
                                    <SelectTrigger id="district" className="h-9 sm:h-10 text-xs sm:text-sm">
                                        <SelectValue placeholder="Select District" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map(d => (
                                            <SelectItem key={d.name} value={d.name} className="text-xs sm:text-sm">{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5 sm:gap-2 sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="ward" className="text-xs sm:text-sm">Ward</Label>
                                <Select value={ward} onValueChange={handleWardChange} disabled={!district}>
                                    <SelectTrigger id="ward" className="h-9 sm:h-10 text-xs sm:text-sm">
                                        <SelectValue placeholder="Select Ward" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wards.map((w) => (
                                            <SelectItem key={w.name} value={w.name} className="text-xs sm:text-sm">{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-1.5 sm:gap-2">
                            <Label className="text-xs sm:text-sm">
                                Pin Location on Map 
                                <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">(Click to refine)</span>
                            </Label>
                            <LocationPicker 
                                onLocationSelect={handleLocationSelect} 
                                center={mapCenter}
                                markerPosition={markerPosition}
                            />
                            {markerPosition && (
                                <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Selected: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/manager/projects')}
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] sm:min-w-[140px] h-9 sm:h-10 text-xs sm:text-sm" 
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
