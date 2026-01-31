import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, ArrowRight, Briefcase, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ManagerDashboardData {
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  assignedEngineers: number;
  availableEngineers: number;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get<ManagerDashboardData>('/dashboard/manager');
        setDashboard(response.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-sm sm:text-base text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const utilizationRate = dashboard ? Math.round((dashboard.assignedEngineers / (dashboard.assignedEngineers + dashboard.availableEngineers || 1)) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 text-sm">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
        <div className="flex-1">
          <h2 className="text-slate-900 text-base sm:text-lg md:text-xl lg:text-2xl tracking-tight font-semibold">
            Welcome back, {user?.name}.
          </h2>
        </div>
        <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md text-xs sm:text-sm h-9 sm:h-10 flex-shrink-0">
          <Link to="/manager/projects/new" className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4">
            <span className="text-base sm:text-lg">+</span>
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 z-10 relative p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-md font-semibold text-slate-900">
              Total Projects
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{dashboard?.totalProjects || 0}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
              {dashboard?.activeProjects || 0} active, {dashboard?.completedProjects || 0} completed
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-2 sm:p-3 lg:p-4 border-t border-slate-50 bg-slate-50/50">
            <Link to="/manager/projects" className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline">
              View Details <ArrowRight className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Pending Requests Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 z-10 relative p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-md font-semibold text-slate-900">
              Pending Requests
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{dashboard?.pendingRequests || 0}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
              Requires approval
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-2 sm:p-3 lg:p-4 border-t border-slate-50 bg-slate-50/50">
            <Link to="/manager/pending" className="text-[10px] sm:text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center hover:underline">
              Review requests <ArrowRight className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Active Resources Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 z-10 relative p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-md font-semibold text-slate-900">
              Active Resources
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{dashboard?.assignedEngineers || 0}</div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">
              Engineers utilized
            </p>
            <Progress value={utilizationRate} className="h-1 sm:h-1.5 mt-2 sm:mt-3 bg-slate-100" indicatorClassName="bg-indigo-500" />
          </CardContent>
          <CardFooter className="pt-0 p-2 sm:p-3 lg:p-4 border-t border-slate-50 bg-slate-50/50">
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium flex items-center">
              {utilizationRate}% Utilization
            </span>
          </CardFooter>
        </Card>

        {/* Budget Utilized Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-md font-semibold text-slate-900">Budget Utilized</CardTitle>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">$45,231</span>
              <span className="text-xs sm:text-sm text-slate-500">/ $120k</span>
            </div>
            <Progress value={38} className="h-1.5 sm:h-2 mt-2 sm:mt-3 bg-slate-100" indicatorClassName="bg-green-600" />
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 font-medium">38% of annual budget spent</p>
          </CardContent>
          <CardFooter className="pt-0 p-2 sm:p-3 lg:p-4 border-t border-slate-50 bg-slate-50/50">
            <Link to="/manager/budget" className="text-[10px] sm:text-xs text-green-700 hover:text-green-800 font-medium flex items-center hover:underline">
              Budget details <ArrowRight className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-8">
        {/* Monthly Spending Chart */}
        <Card className="lg:col-span-4 border-slate-200 shadow-sm">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900">Monthly Spending</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Project expenditure trend over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0 lg:pl-2">
            <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full mt-2 sm:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Jan', total: 4500 },
                  { name: 'Feb', total: 3200 },
                  { name: 'Mar', total: 6000 },
                  { name: 'Apr', total: 5500 },
                  { name: 'May', total: 4800 },
                  { name: 'Jun', total: 7200 },
                ]}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} strokeOpacity={0.6} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Expenditure"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals / Recent Activity */}
        <Card className="lg:col-span-4 border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4 lg:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">Pending Approvals</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Click a request to review.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-50/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 font-medium">Request</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 font-medium">Date</th>
                    <th className="px-2 sm:px-3 py-2 sm:py-3 font-medium text-right hidden sm:table-cell">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 1, label: 'Material Purchase', color: 'bg-amber-500', date: 'Today', amount: '$1,250' },
                    { id: 2, label: 'Equipment Rental', color: 'bg-blue-500', date: 'Yesterday', amount: '$450' },
                    { id: 3, label: 'Subcontractor PO', color: 'bg-indigo-500', date: 'Oct 24', amount: '$5,000' },
                    { id: 4, label: 'Site Services', color: 'bg-emerald-500', date: 'Oct 22', amount: '$850' },
                    { id: 5, label: 'Material Purchase', color: 'bg-amber-500', date: 'Oct 20', amount: '$2,100' }
                  ].slice(0, 5).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/manager/pending/${item.id}`)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${item.color} flex-shrink-0`} />
                          <span className="truncate text-xs sm:text-sm">{item.label}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-slate-500 whitespace-nowrap text-xs sm:text-sm">{item.date}</td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-slate-600 font-medium whitespace-nowrap text-xs sm:text-sm text-right hidden sm:table-cell">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-2 sm:p-3 border-t border-slate-100 bg-slate-50/50 text-center mt-auto rounded-b-lg">
              <Link to="/manager/pending" className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-flex items-center">
                View All Pending Requests ({dashboard?.pendingRequests || 0}) <ArrowRight className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
