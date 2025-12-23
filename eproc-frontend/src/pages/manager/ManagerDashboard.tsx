import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
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
        <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
            <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const utilizationRate = dashboard ? Math.round((dashboard.assignedEngineers / (dashboard.assignedEngineers + dashboard.availableEngineers || 1)) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-700 mt-1">Welcome back, {user?.name}. </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-[#2a3455] hover:bg-[#1e253e] text-white shadow-md">
             <Link to="/manager/projects/new">
                + New Project
             </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="h-20 w-20 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-md font-semibold text-slate-900">
              Total Projects
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.totalProjects || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {dashboard?.activeProjects || 0} active, {dashboard?.completedProjects || 0} completed
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
             <Link to="/manager/projects" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center hover:underline">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
             </Link>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-20 w-20 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-md font-semibold text-slate-900">
              Pending Requests
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.pendingRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Requires approval
            </p>
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
            <Link to="/manager/pending" className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center hover:underline">
               Review requests <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="h-20 w-20 text-indigo-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <CardTitle className="text-md font-semibold text-slate-900">
              Active Resources
            </CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
               <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-slate-900">{dashboard?.assignedEngineers || 0}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Engineers utilized
            </p>
            <Progress value={utilizationRate} className="h-1.5 mt-3 bg-slate-100" indicatorClassName="bg-indigo-500" />
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium flex items-center">
               {utilizationRate}% Utilization
            </span>
          </CardFooter>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden relative group md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-semibold text-slate-900">Budget Utilized</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">$45,231</span>
                <span className="text-sm text-slate-500">/ $120k</span>
             </div>
             <Progress value={38} className="h-2 mt-3 bg-slate-100" indicatorClassName="bg-green-600" />
             <p className="text-xs text-slate-500 mt-2 font-medium">38% of annual budget spent</p>
          </CardContent>
          <CardFooter className="pt-0 p-4 border-t border-slate-50 bg-slate-50/50">
             <Link to="/manager/budget" className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center hover:underline">
                Budget details <ArrowRight className="ml-1 h-3 w-3" />
             </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
         {/* Monthly Spending Chart */}
         <Card className="col-span-4 border-slate-200 shadow-sm">
            <CardHeader>
               <CardTitle className="text-lg font-bold text-slate-900">Monthly Spending</CardTitle>
               <CardDescription>Project expenditure trend over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
               <div className="h-[300px] w-full mt-4">
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
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} strokeOpacity={0.6} stroke="#e2e8f0" />
                     <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                     />
                     <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Legend verticalAlign="top" height={36}/>
                     <Area 
                        type="monotone" 
                        dataKey="total" 
                        name="Expenditure"
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         {/* Pending Approvals / Recent Activity */}
         <Card className="col-span-3 border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                   <CardTitle className="text-lg font-bold text-slate-900">Pending Approvals</CardTitle>
                   <CardDescription>Requests requiring action.</CardDescription>
                </div>
             </CardHeader>
             <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                 <div className="overflow-hidden">
                    <table className="w-full text-sm text-left table-fixed">
                       <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 sticky top-0 z-10 block w-full table-header-group">
                          <tr>
                             <th className="px-4 py-3 font-medium w-[40%]">Request</th>
                             <th className="px-2 py-3 font-medium w-[20%]">Date</th>
                             <th className="px-2 py-3 font-medium w-[20%]">Amount</th>
                             <th className="px-2 py-3 font-medium text-right w-[20%]">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 block w-full table-row-group">
                          {[
                              { label: 'Material Purchase', color: 'bg-amber-500', date: 'Today', amount: '$1,250' },
                              { label: 'Equipment Rental', color: 'bg-blue-500', date: 'Yesterday', amount: '$450' },
                              { label: 'Subcontractor PO', color: 'bg-indigo-500', date: 'Oct 24', amount: '$5,000' },
                              { label: 'Site Services', color: 'bg-emerald-500', date: 'Oct 22', amount: '$850' },
                              { label: 'Material Purchase', color: 'bg-amber-500', date: 'Oct 20', amount: '$2,100' }
                          ].slice(0, 5).map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-4 py-3 text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <div className="flex items-center gap-2">
                                       <div className={`h-2 w-2 rounded-full ${item.color} flex-shrink-0`} />
                                       <span className="truncate">{item.label}</span>
                                    </div>
                                 </td>
                                 <td className="px-2 py-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                                 <td className="px-2 py-3 text-slate-600 font-medium whitespace-nowrap">{item.amount}</td>
                                 <td className="px-2 py-3 text-right">
                                    <Button size="sm" variant="outline" className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">Review</Button>
                                 </td>
                              </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center mt-auto">
                    <Link to="/manager/pending" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-flex items-center">
                       View All Pending Requests ({dashboard?.pendingRequests || 0}) <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                 </div>
             </CardContent>
         </Card>


      </div>
    </div>
  );
};

export default ManagerDashboard;
