import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, X } from 'lucide-react';
import { getExchangeRate, convertFromTZS, convertToTZS } from '@/lib/currency';
import { LocationPicker } from '@/components/ui/location-picker';

const CreateProject = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // Financials
    const [displayBudget, setDisplayBudget] = useState(''); // What user sees
    const [currency, setCurrency] = useState('TZS'); // Selected currency
    const [exchangeRate, setExchangeRate] = useState<number>(2500);

    // Location
    const [region, setRegion] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch rate on mount
    useEffect(() => {
        const initRate = async () => {
            const rate = await getExchangeRate();
            setExchangeRate(rate);
        };
        initRate();
    }, []);

    // Handle currency toggle
    const handleCurrencyChange = (newCurrency: string) => {
        if (!displayBudget) {
            setCurrency(newCurrency);
            return;
        }

        // Convert current display value to TZS (base)
        const currentAmount = parseFloat(displayBudget);
        if (isNaN(currentAmount)) {
             setCurrency(newCurrency);
             return;
        }

        const amountInTZS = convertToTZS(currentAmount, currency, exchangeRate);
        const newDisplayAmount = convertFromTZS(amountInTZS, newCurrency, exchangeRate); // Returns string

        setDisplayBudget(newDisplayAmount);
        setCurrency(newCurrency);
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setCoordinates({ lat, lng });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Calculate budget in TZS for storage
            const budgetVal = parseFloat(displayBudget);
            const budgetInTZS = convertToTZS(isNaN(budgetVal) ? 0 : budgetVal, currency, exchangeRate);

            // 2. Format location string
            const locString = coordinates ? `${coordinates.lat},${coordinates.lng}` : '';

            await api.post('/projects', {
                name,
                description,
                budgetTotal: budgetInTZS,
                currency: 'TZS', // Always store as TZS
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
        <div className="container max-w-4xl mx-auto py-10 space-y-8">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900">Create New Project</CardTitle>
                            <CardDescription>Initiate a new construction endeavor by filling out the essential details below.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => navigate('/manager/projects')}>
                            <X className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Section 1: General Info */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold text-slate-900 border-b pb-2">1. General Information</h3>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Skyline Tower Renovation"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Scope and objectives..."
                                        className="resize-none h-24"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financials */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold text-slate-900 border-b pb-2">2. Financials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Input Currency</Label>
                                    <select
                                        id="currency"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={currency}
                                        onChange={(e) => handleCurrencyChange(e.target.value)}
                                    >
                                        <option value="TZS">TZS - Tanzanian Shilling</option>
                                        <option value="USD">USD - US Dollar</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">Values are stored in TZS. Estimated Rate: 1 USD = {exchangeRate} TZS</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="budget">Budget Total</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={displayBudget}
                                        onChange={(e) => setDisplayBudget(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Location Details */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold text-slate-900 border-b pb-2">3. Site Location</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="region">Region</Label>
                                    <Input id="region" placeholder="e.g. Dar es Salaam" value={region} onChange={e => setRegion(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="district">District</Label>
                                    <Input id="district" placeholder="e.g. Kinondoni" value={district} onChange={e => setDistrict(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ward">Ward</Label>
                                    <Input id="ward" placeholder="e.g. Msasani" value={ward} onChange={e => setWard(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Pin Location on Map</Label>
                                <div className="border rounded-md overflow-hidden">
                                     <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                                {coordinates && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Selected: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                                    </p>
                                )}
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 bg-slate-50/50 p-6 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => navigate('/manager/projects')}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default CreateProject;
