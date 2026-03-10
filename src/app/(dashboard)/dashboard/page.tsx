'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';

const kpiData = [
  { label: 'Active Clients', value: '142', trend: '+12%', trendUp: true, color: 'var(--color-primary)' },
  { label: 'Pending Proposals', value: '28', trend: '-5%', trendUp: false, color: 'var(--color-success)' },
  { label: 'Ongoing Assignments', value: '65', trend: '+8%', trendUp: true, color: 'var(--color-warning)' },
  { label: 'Unbilled Amount', rawValue: 1250000, trend: '+15%', trendUp: true, color: 'var(--color-violet)' },
];

const assignmentByStatus = [
  { name: 'Not Started', value: 15, color: 'var(--text-muted)' },
  { name: 'In Progress', value: 35, color: 'var(--color-primary)' },
  { name: 'Review', value: 10, color: 'var(--color-warning)' },
  { name: 'Completed', value: 40, color: 'var(--color-success)' },
];

const revenueByPartner = [
  { name: 'Rahul K.', revenue: 450000 },
  { name: 'Sneha P.', revenue: 380000 },
  { name: 'Amit J.', revenue: 520000 },
  { name: 'Priya R.', revenue: 290000 },
];

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Section */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Welcome back. Here is what's happening across your assignments today.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="card" style={{ borderTop: `4px solid ${kpi.color}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kpi.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {kpi.rawValue ? formatIndianCurrency(kpi.rawValue, true, true) : kpi.value}
              </span>
              <span style={{ 
                fontSize: '0.875rem', fontWeight: 600, 
                color: kpi.trendUp ? 'var(--color-success)' : 'var(--color-danger)' 
              }}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Bar Chart */}
        <div className="card" style={{ height: 400, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Revenue by Partner</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPartner} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  tickFormatter={(val) => formatIndianCurrency(val, true, true)} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-muted)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-dropdown)', background: 'var(--bg-surface)' }}
                  formatter={(value: any) => [formatIndianCurrency(Number(value)), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ height: 400, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Assignments by Status</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentByStatus}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {assignmentByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-dropdown)', background: 'var(--bg-surface)' }}
                  itemStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem', fontWeight: 500, paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity Table (Mock) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Recent Activity</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', minWidth: 600 }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Assignment</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TechCorp India</td>
                <td>Statutory Audit FY24</td>
                <td><span className="badge badge-amber">In Progress</span></td>
                <td>Sneha P.</td>
                <td style={{ color: 'var(--text-muted)' }}>2 hours ago</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Global Logistics</td>
                <td>Tax Advisory</td>
                <td><span className="badge badge-green">Completed</span></td>
                <td>Rahul K.</td>
                <td style={{ color: 'var(--text-muted)' }}>1 day ago</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Innovate Retail</td>
                <td>Internal Audit Q3</td>
                <td><span className="badge badge-gray">Not Started</span></td>
                <td>Amit J.</td>
                <td style={{ color: 'var(--text-muted)' }}>3 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
