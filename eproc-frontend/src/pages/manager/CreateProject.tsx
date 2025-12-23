import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, X } from 'lucide-react';

const CURRENCY_API_URL = import.meta.env.VITE_CURRENCY_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD';

const CreateProject = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('TZS');
  const [siteLocation, setSiteLocation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Fetch Exchange Rate on mount
  useEffect(() => {
    const fetchRate = async () => {
        try {
            const res = await fetch(CURRENCY_API_URL);
            const data = await res.json();
            // Assuming API returns base USD, we want USD -> TZS rate
            // If base is USD, to get TZS we look at data.rates.TZS
            if (data && data.rates && data.rates.TZS) {
                setExchangeRate(data.rates.TZS);
            }
        } catch (error) {
            console.error("Failed to fetch exchange rate:", error);
            // Fallback rate if API fails
            setExchangeRate(2500); 
        }
    };
    fetchRate();
  }, []);

  // Handle Currency Conversion
  const handleCurrencyChange = (newCurrency: string) => {
    const currentAmount = parseFloat(budget);
    const rate = exchangeRate || 2500; // Default fallback

    if (!isNaN(currentAmount) && budget !== '') {
      if (currency === 'TZS' && newCurrency === 'USD') {
         // TZS -> USD
         setBudget((currentAmount / rate).toFixed(2));
      } else if (currency === 'USD' && newCurrency === 'TZS') {
         // USD -> TZS
         setBudget((currentAmount * rate).toFixed(0));
      }
    }
    setCurrency(newCurrency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/projects', {
        name,
        description,
        budgetTotal: parseFloat(budget) || 0,
        currency,
        siteLocation
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
    <div className="container max-w-3xl mx-auto py-10 space-y-8">
      {/* Header aligned or centered as per preference, matching mockup */}
      
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
          <CardContent className="space-y-6">
             {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

             {/* General Information */}
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">General Information</h3>
                <div className="grid gap-2">
                   <Label htmlFor="name">Project Name</Label>
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
                      placeholder="Provide a brief overview of the project scope and objectives..." 
                      className="resize-none h-24"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                   />
                </div>
             </div>

             <div className="border-t border-slate-100 my-4" />

             {/* Financials */}
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Financials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="grid gap-2">
                      <Label htmlFor="budget">Budget Total</Label>
                      <div className="relative">
                         <div className="absolute left-3 top-2.5 text-slate-500">
                             {currency === 'USD' ? '$' : 'TSh'}
                         </div>
                         <Input 
                            id="budget" 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="pl-12"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="grid gap-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={currency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                      >
                         <option value="TZS">TZS - Tanzanian Shilling</option>
                         <option value="USD">USD - US Dollar</option>
                      </select>
                   </div>
                </div>
             </div>
             
             <div className="border-t border-slate-100 my-4" />

             {/* Site Details */}
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Site Details</h3>
                <div className="grid gap-2">
                   <Label htmlFor="location">Site Location</Label>
                   <div className="relative">
                       <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                       <Input 
                          id="location" 
                          placeholder="Enter address or coordinates" 
                          className="pl-9"
                          value={siteLocation}
                          onChange={(e) => setSiteLocation(e.target.value)}
                       />
                   </div>
                </div>
                {/* Visual Map Placeholder */}
                <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center group cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <Button type="button" variant="secondary" size="sm" className="z-10 bg-white/80 hover:bg-white shadow-sm text-indigo-700">
                        <MapPin className="mr-2 h-3 w-3" /> Pin on Map
                    </Button>
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
