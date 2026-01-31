import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Project } from '@/types/models';

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProjects = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Connection failed. Please check your internet connection and try again.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'; // Uses primary color
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const handleRowClick = (projectId: number) => {
    navigate(`/manager/projects/${projectId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Error:</span> {error}
          </div>
          <Button variant="ghost" size="sm" onClick={loadProjects} className="text-red-700 hover:bg-red-100 text-xs sm:text-sm">
            Retry
          </Button>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-3 sm:p-4 lg:p-6 pb-3 sm:pb-4">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors text-sm h-9 sm:h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                 <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md text-xs sm:text-sm h-9 sm:h-10 flex-shrink-0">
              <Link to="/manager/projects/new" className="flex items-center justify-center gap-1 sm:gap-1.5">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Create New Project</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          {loading ? (
             <div className="text-center py-8 sm:py-10 text-slate-500 text-sm sm:text-base">Loading projects...</div>
          ) : error ? (
             <div className="text-center py-8 sm:py-10 text-slate-400 text-sm sm:text-base">Could not load projects.</div>
          ) : filteredProjects.length === 0 ? (
             <div className="text-center py-8 sm:py-10 text-slate-500 text-sm sm:text-base">No projects found.</div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Project Name</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">Budget</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Team</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow 
                        key={project.id} 
                        onClick={() => handleRowClick(project.id)}
                        className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                      >
                        <TableCell className="font-medium text-slate-900 text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3">
                          <span className="line-clamp-1">{project.name}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2.5 sm:py-3">
                          <Badge 
                            variant={getStatusBadgeVariant(project.status)}
                            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                          >
                            {project.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs sm:text-sm px-2 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                          <span className="hidden sm:inline">{project.currency} </span>
                          <span className="sm:hidden">TZS </span>
                          {project.budgetTotal?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs sm:text-sm px-2 sm:px-4 py-2.5 sm:py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                            <span>{project.teamCount || 0} members</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 py-2.5 sm:py-3 hidden md:table-cell">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm h-7 sm:h-8"
                            onClick={(e) => e.stopPropagation()}
                          >
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProjects;
