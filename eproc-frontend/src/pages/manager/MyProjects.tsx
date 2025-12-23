import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Project {
  id: number;
  name: string;
  currency: string;
  budgetTotal: number;
  status: string;
  bossId: number;
  bossName: string;
  engineerId: number | null;
  engineerName: string | null;
  engineerEmail: string | null;
}

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.engineerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'; // Uses primary color
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and track your construction sites.</p>
        </div>
        <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
          <Link to="/manager/projects/new">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search projects..." 
                className="pl-9 border-slate-200 bg-slate-50" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="border-slate-200 text-slate-500">
               <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-10 text-slate-500">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
             <div className="text-center py-10 text-slate-500">No projects found.</div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Project Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Budget</TableHead>
                    <TableHead className="font-semibold text-slate-700">Engineer</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {project.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {project.currency} {project.budgetTotal?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {project.engineerName ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                              {project.engineerName.charAt(0)}
                            </div>
                            {project.engineerName}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          <Link to={`/manager/projects/${project.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProjects;
