import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Briefcase,
  Calendar,
  AlertOctagon,
  XCircle,
  RotateCw,
  ChevronDown
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RequestSummary {
  id: number;
  title: string;
  additionalDetails?: string;
  siteName?: string;
  projectName?: string;
  projectId?: number;
  status: string;
  totalValue: number;
  createdAt: string;
  createdByName?: string;
  plannedStartDate?: string;
  priority?: string;
  isDuplicateFlagged?: boolean;
  duplicateExplanation?: string;
}

type SortField = 'date' | 'priority' | 'amount';
type SortOrder = 'asc' | 'desc';

/**
 * Requests page - Comprehensive request management for Engineers.
 * Displays all requests for projects the engineer is assigned to with filtering, sorting, searching, and project grouping.
 */
const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Project Grouping State
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const loadRequests = useCallback(async () => {
    try {
      // Fetching engineer's requests
      const response = await api.get<RequestSummary[]>('/requests/my-requests');
      setRequests(response.data);

      // Initialize all projects as expanded by default
      const projects = new Set(response.data.map(r => r.projectName || 'Unassigned'));
      const initialExpanded = Array.from(projects).reduce((acc, project) => ({
        ...acc,
        [project]: true
      }), {});
      setExpandedProjects(initialExpanded);

    } catch (err) {
      console.error('Failed to load requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRowClick = (requestId: number) => {
    navigate(`/engineer/batches/${requestId}`);
  };

  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };

  // Filter, Search, and Sort Logic
  const processedRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      // Status Filter
      if (statusFilter !== 'ALL' && request.status !== statusFilter) return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (request.title || '').toLowerCase().includes(query);
        const matchesDetails = (request.additionalDetails || '').toLowerCase().includes(query);
        const matchesSite = (request.siteName || '').toLowerCase().includes(query);
        const matchesRequester = (request.createdByName || '').toLowerCase().includes(query);
        const matchesProject = (request.projectName || '').toLowerCase().includes(query);

        return matchesTitle || matchesDetails || matchesSite || matchesRequester || matchesProject;
      }
      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          comparison = dateA - dateB;
          break;
        case 'amount':
          comparison = a.totalValue - b.totalValue;
          break;
        case 'priority':
          const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const pA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
          const pB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
          comparison = pA - pB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [requests, statusFilter, searchQuery, sortField, sortOrder]);

  // Group by Project
  const groupedRequests = useMemo(() => {
    const groups: Record<string, RequestSummary[]> = {};
    processedRequests.forEach(req => {
      const project = req.projectName || 'Unassigned Projects';
      if (!groups[project]) groups[project] = [];
      groups[project].push(req);
    });
    return groups;
  }, [processedRequests]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      case 'PARTIALLY_APPROVED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3 mr-1" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'REJECTED': return <XCircle className="h-3 w-3 mr-1" />;
      case 'PARTIALLY_APPROVED': return <RotateCw className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search requests, sites, team..."
              className="pl-10 h-10 bg-white border-slate-200 focus:border-indigo-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
              <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Sort by</span>
                  <span className="font-medium">{sortField}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-3 border-slate-200 bg-white hover:bg-slate-50 gap-1 flex items-center"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <span className="text-sm font-medium text-slate-600">{sortOrder === 'asc' ? 'asc' : 'desc'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform text-slate-500 pt-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{sortOrder === 'asc' ? 'Sort asc' : 'Sort desc'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Status Filters - Pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'].map(status => {
            const count = requests.filter(r => status === 'ALL' ? true : r.status === status).length;
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-sm ${isActive
                  ? 'bg-[#2a3455] text-white hover:bg-[#1e253e]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                {status.replace('_', ' ')}
                {count > 0 && (
                  <span className={`ml-1.5 flex items-center justify-center px-1.5 h-5 min-w-[1.25rem] rounded-full text-[10px] ${isActive
                    ? 'bg-white text-[#2a3455]'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 flex-1">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* Content */}
      {processedRequests.length === 0 ? (
        <Card className="border-slate-200 shadow-sm border-dashed">
          <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No requests found</h3>
            {/* <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            {statusFilter !== 'ALL' && (
              <Button
                variant="link"
                onClick={() => setStatusFilter('ALL')}
                className="mt-4 text-indigo-600 font-medium"
              >
                Clear Filters
              </Button>
            )} */}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRequests).map(([projectName, projectRequests]) => (
            <div key={projectName} className="space-y-3">
              {/* Project Header */}
              <div
                className="flex items-center gap-2 cursor-pointer group select-none"
                onClick={() => toggleProject(projectName)}
              >
                <div className={`p-1 rounded hover:bg-slate-100 transition-all duration-200 ${!expandedProjects[projectName] ? '-rotate-90' : 'rotate-0'}`}>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#2a3455] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#2a3455]" />
                  {projectName}
                  <span className="text-xs font-normal text-slate-500 ml-1">({projectRequests.length} requests)</span>
                </h3>
                <div className="h-px flex-1 bg-slate-200 ml-2 group-hover:bg-slate-300 transition-colors" />
              </div>

              {/* Project Content */}
              {expandedProjects[projectName] && (
                <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
                  {/* Desktop Table View */}
                  <Card className="border-slate-200 shadow-none hidden md:block overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-[#2a3455]">
                          <TableRow className="hover:bg-[#2a3455] border-b-0">
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Request Name</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Site</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Requested By</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto hidden lg:table-cell">Date</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Priority</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Amount (TZS)</TableHead>
                            <TableHead className="text-white text-xs lg:text-sm font-semibold uppercase p-3 pr-0 h-auto">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projectRequests.map(request => (
                            <TableRow
                              key={request.id}
                              onClick={() => handleRowClick(request.id)}
                              className="hover:bg-indigo-50/50 cursor-pointer transition-colors group border-slate-100"
                            >
                              <TableCell className="p-2 pr-0 max-w-[210px]">
                                <span className="font-semibold text-slate-700 text-xs lg:text-sm block " title={request.title}>
                                  {request.title || request.additionalDetails || 'BOQ Request'}
                                </span>
                                {request.isDuplicateFlagged && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex ml-1 align-middle cursor-help">
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Duplicate Request</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </TableCell>
                              <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-600 lg:max-w-[120px]">
                                {request.siteName || 'N/A'}
                              </TableCell>
                              <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-600 lg:max-w-[120px]">
                                {request.createdByName || 'Unknown'}
                              </TableCell>
                              <TableCell className="p-2 pr-0 text-xs lg:text-sm text-slate-600 hidden lg:table-cell lg:max-w-[100px]">
                                {request.plannedStartDate
                                  ? new Date(request.plannedStartDate).toLocaleDateString()
                                  : new Date(request.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="p-2 pr-0 lg:max-w-[100px]">
                                {request.priority && (
                                  <div className={`flex items-center gap-1 text-[10px] lg:text-xs font-medium  ${request.priority === 'HIGH' ? 'text-red-700' : 'text-slate-600'
                                    }`}>
                                    {request.priority === 'HIGH' && <AlertOctagon className="h-3 w-3" />}
                                    {request.priority}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="p-2 pr-0 text-xs lg:text-sm font-bold text-slate-900 font-mono lg:max-w-[130px]">
                                {request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="p-2 pr-0">
                                <div className={`flex gap-1 text-[10px] lg:text-xs font-medium items-center ${request.status === 'PENDING' ? 'text-amber-700' :
                                  request.status === 'SUBMITTED' ? 'text-blue-700' :
                                    request.status === 'APPROVED' ? 'text-green-700' :
                                      request.status === 'REJECTED' ? 'text-red-700' :
                                        request.status === 'PARTIALLY_APPROVED' ? 'text-indigo-700' :
                                          'text-slate-700'
                                  }`}>
                                  {getStatusIcon(request.status)}
                                  {request.status.replace('_', ' ')}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  {/* Mobile Card View */}
                  <div className="space-y-3 md:hidden">
                    {projectRequests.map(request => (
                      <Card
                        key={request.id}
                        className="border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                        onClick={() => handleRowClick(request.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                                  {request.title || request.additionalDetails || 'BOQ Request'}
                                </h3>
                                {request.priority === 'HIGH' && (
                                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {request.siteName || 'No Site'}
                              </p>
                              {request.isDuplicateFlagged && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex ml-1 align-middle cursor-help">
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Duplicate Request</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <Badge className={`${getStatusBadgeClass(request.status)} text-[10px] px-2 py-0.5 whitespace-nowrap flex-shrink-0 border`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {request.plannedStartDate
                                ? new Date(request.plannedStartDate).toLocaleDateString()
                                : new Date(request.createdAt).toLocaleDateString()}
                            </div>
                            <span className="font-bold text-sm text-slate-900 font-mono">
                              TZS {request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
