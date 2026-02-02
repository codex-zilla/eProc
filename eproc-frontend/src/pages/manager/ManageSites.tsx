import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import type { Project, Site } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { LocationPicker } from '@/components/ui/location-picker';
// import { useToast } from '@/components/ui/use-toast'; // Not found, temporarily removing

const ManageSites = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // const { toast } = useToast();
    
    const [project, setProject] = useState<Project | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        budgetCap: '',
        location: '',
        gpsCenter: ''
    });
    const [saving, setSaving] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [projData, sitesData] = await Promise.all([
                projectService.getProjectById(parseInt(id)),
                projectService.getSitesByProject(parseInt(id))
            ]);
            setProject(projData);
            setSites(sitesData);
        } catch (error) {
            console.error('Failed to load data', error);
            // toast({ variant: "destructive", title: "Error", description: "Failed to load project data" });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (site?: Site) => {
        if (site) {
            setEditingSite(site);
            setFormData({
                name: site.name,
                budgetCap: site.budgetCap?.toString() || '',
                location: site.location || '',
                gpsCenter: site.gpsCenter || ''
            });
            if (site.gpsCenter) {
                const [lat, lng] = site.gpsCenter.split(',').map(s => parseFloat(s.trim()));
                if (!isNaN(lat) && !isNaN(lng)) setMarkerPosition({ lat, lng });
                else setMarkerPosition(null);
            } else {
                setMarkerPosition(null);
            }
        } else {
            setEditingSite(null);
            setFormData({ name: '', budgetCap: '', location: '', gpsCenter: '' });
            setMarkerPosition(null); // Could default to project location if available
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!id || !formData.name) return;
        
        try {
            setSaving(true);
            const payload = {
                projectId: parseInt(id),
                name: formData.name,
                budgetCap: formData.budgetCap ? parseFloat(formData.budgetCap) : 0,
                location: formData.location,
                gpsCenter: markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : formData.gpsCenter
            };

            if (editingSite) {
                await projectService.updateSite(editingSite.id, payload);
                // toast({ title: "Success", description: "Site updated successfully" });
            } else {
                await projectService.createSite(payload);
                // toast({ title: "Success", description: "Site created successfully" });
            }
            
            setIsModalOpen(false);
            loadData(); // Refresh list
        } catch (error) {
            console.error('Save failed', error);
            // toast({ variant: "destructive", title: "Error", description: "Failed to save site" });
            alert("Failed to save site");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (siteId: number) => {
        if (!confirm('Are you sure you want to delete this site?')) return;
        try {
            await projectService.deleteSite(siteId);
            // toast({ title: "Success", description: "Site deleted" });
            loadData();
        } catch (error) {
            // toast({ variant: "destructive", title: "Error", description: "Failed to delete site" });
            alert("Failed to delete site");
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
        setFormData(prev => ({ ...prev, gpsCenter: `${lat.toFixed(6)},${lng.toFixed(6)}` }));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/manager/projects/${id}`)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Sites</h1>
                        <p className="text-gray-500">{project.name} ({project.code || 'No Code'})</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" /> Add Site
                </Button>
            </div>

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map(site => (
                    <Card key={site.id} className="relative group">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-semibold">{site.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" /> {site.location || 'No location set'}
                                    </CardDescription>
                                </div>
                                <Badge variant={site.isActive ? "default" : "secondary"}>
                                    {site.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Budget Cap</span>
                                    <span className="font-medium">{project.currency} {site.budgetCap?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">GPS</span>
                                    <code className="bg-gray-100 px-1 rounded text-xs">{site.gpsCenter || 'N/A'}</code>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={() => handleOpenModal(site)}>
                                    <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(site.id)}>
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {sites.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No sites found for this project.</p>
                        <Button variant="link" onClick={() => handleOpenModal()}>Create your first site</Button>
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
                        <DialogDescription>
                            {editingSite ? 'Update site details below.' : 'Enter details for the new site.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Site Name <span className="text-red-500">*</span></Label>
                            <Input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Block A" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Budget Cap ({project.currency})</Label>
                            <Input 
                                type="number" 
                                value={formData.budgetCap} 
                                onChange={e => setFormData({...formData, budgetCap: e.target.value})} 
                                placeholder="0.00" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})} 
                                placeholder="e.g. Ward, District" 
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label>GPS Coordinates</Label>
                            <div className="h-[200px] w-full border rounded-md overflow-hidden relative">
                                <LocationPicker 
                                    center={markerPosition || { lat: -6.7924, lng: 39.2083 }}
                                    markerPosition={markerPosition} 
                                    onLocationSelect={handleLocationSelect} 
                                />
                            </div>
                            <div className="text-xs text-gray-500 text-right">
                                {markerPosition ? `${markerPosition.lat.toFixed(6)}, ${markerPosition.lng.toFixed(6)}` : 'No location picked'}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving ? 'Saving...' : 'Save Site'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageSites;
