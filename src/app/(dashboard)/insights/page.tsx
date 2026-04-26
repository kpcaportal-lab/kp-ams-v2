'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, AlertCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, Filter, Download, PieChart as PieChartIcon
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface InsightData {
  monthlyRevenue: any[];
  partnerPerformance: any[];
  clientDues: any[];
  categoryRevenue: any[];
  managerWorkload: any[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState('2025-26');

  useEffect(() => {
    fetchInsights();
  }, [fiscalYear]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/dashboard/insights?fiscal_year=${fiscalYear}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
      toast.error('Failed to load financial intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const processMonthlyData = () => {
    if (!data) return [];
    return data.monthlyRevenue.map(item => ({
      name: MONTH_NAMES[item.month - 1] || `M${item.month}`,
      Planned: Number(item.planned),
      Billed: Number(item.billed)
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Analyzing financial data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            Financial Intelligence
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time revenue analytics and collection insights</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <select 
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 px-4 py-2 cursor-pointer"
          >
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
          <button 
            onClick={fetchInsights}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            title="Refresh Data"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Monthly Revenue Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Billed vs Planned allocations</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 text-blue-600">
                <div className="w-3 h-3 rounded-full bg-blue-600" /> Planned
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <div className="w-3 h-3 rounded-full bg-emerald-600" /> Billed
              </div>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processMonthlyData()}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(v: number) => [formatCurrency(v), '']}
                />
                <Area type="monotone" dataKey="Planned" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPlanned)" />
                <Area type="monotone" dataKey="Billed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBilled)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              Revenue by Category
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution across assignment types</p>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data?.categoryRevenue}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="category"
                >
                  {data?.categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full mt-6 space-y-2">
              {data?.categoryRevenue.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                    <span className="text-slate-600 font-medium">Category {cat.category}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manager Workload (Resource Planning) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Resource Planning: Manager Workload
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Active assignments count per manager</p>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.managerWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={120} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar 
                  dataKey="active_assignments" 
                  name="Active Assignments" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Dues */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Outstanding Dues
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top clients by pending collection</p>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.clientDues.map((c, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-bold text-slate-900 truncate" title={c.name}>{c.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Client</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-rose-600">{formatCurrency(c.outstanding)}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Collected: {formatCurrency(c.collected)}</div>
                </div>
              </div>
            ))}
            {data?.clientDues.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium italic">
                All dues are cleared!
              </div>
            )}
          </div>
        </div>

        {/* Partner Performance */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Partner Collection Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Billed vs Collected per responsible partner</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {data?.partnerPerformance.map((p, idx) => {
              const pct = p.billed > 0 ? (p.collected / p.billed) * 100 : 0;
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shadow-sm">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">Collection Rate: {pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{formatCurrency(p.collected)}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">of {formatCurrency(p.billed)} billed</div>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
