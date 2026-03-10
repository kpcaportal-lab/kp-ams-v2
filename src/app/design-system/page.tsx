'use client';

import { Building2, BarChart3, FileText, Users, Receipt, ClipboardList } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', padding: '3rem 2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={22} color="#fff" />
          </div>
          <h1 className="page-title text-gradient-blue" style={{ fontSize: '2rem' }}>
            K&amp;P Assignment Management
          </h1>
        </div>
        <p className="page-subtitle">
          Foundation loaded — design system ready for Phase 2
        </p>
      </div>

      {/* KPI Cards — Each with a different accent color */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto 2.5rem' }}>
        <div className="kpi-card kpi-card--blue">
          <span className="kpi-label">Total Billed</span>
          <span className="kpi-value" style={{ color: 'var(--color-primary)' }}>₹45,00,000</span>
        </div>
        <div className="kpi-card kpi-card--green">
          <span className="kpi-label">Active Assignments</span>
          <span className="kpi-value" style={{ color: 'var(--color-success)' }}>128</span>
        </div>
        <div className="kpi-card kpi-card--amber">
          <span className="kpi-label">Pending Proposals</span>
          <span className="kpi-value" style={{ color: 'var(--color-warning)' }}>24</span>
        </div>
        <div className="kpi-card kpi-card--violet">
          <span className="kpi-label">Clients</span>
          <span className="kpi-value" style={{ color: 'var(--color-violet)' }}>86</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ maxWidth: 1000, margin: '0 auto 2.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Button Variants
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary"><FileText size={16} /> New Proposal</button>
          <button className="btn btn-success"><ClipboardList size={16} /> Create Assignment</button>
          <button className="btn btn-warning"><Receipt size={16} /> Generate Invoice</button>
          <button className="btn btn-danger">Delete</button>
          <button className="btn btn-secondary"><Users size={16} /> View Users</button>
          <button className="btn btn-ghost"><BarChart3 size={16} /> Reports</button>
        </div>
      </div>

      {/* Badges */}
      <div style={{ maxWidth: 1000, margin: '0 auto 2.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Status Badges
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">Primary</span>
          <span className="badge badge-green">Won</span>
          <span className="badge badge-amber">Pending</span>
          <span className="badge badge-red">Lost</span>
          <span className="badge badge-violet">Admin</span>
          <span className="badge badge-teal">Director</span>
          <span className="badge badge-indigo">Partner</span>
          <span className="badge badge-orange">Manager</span>
          <span className="badge badge-gray">Inactive</span>
        </div>
      </div>

      {/* Sample Table */}
      <div style={{ maxWidth: 1000, margin: '0 auto 2.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Sample Table
        </h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Category</th>
                <th>Fees</th>
                <th>Status</th>
                <th>Partner</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>EPPS Infotech Ltd</td>
                <td><span className="badge badge-blue">A — Routine</span></td>
                <td>₹3,50,000</td>
                <td><span className="badge badge-green">Active</span></td>
                <td>Suhas Kirtane</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Tata Consultancy</td>
                <td><span className="badge badge-violet">C — Forensic</span></td>
                <td>₹12,00,000</td>
                <td><span className="badge badge-amber">Draft</span></td>
                <td>Sachin Pandit</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Reliance Industries</td>
                <td><span className="badge badge-teal">B — IFC</span></td>
                <td>₹8,75,000</td>
                <td><span className="badge badge-green">Active</span></td>
                <td>Rajesh Kumar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Inputs */}
      <div style={{ maxWidth: 1000, margin: '0 auto 2.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Form Controls
        </h2>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Client Name</label>
              <input className="input" placeholder="Enter client name..." />
            </div>
            <div>
              <label className="label">Assignment Type</label>
              <select className="select">
                <option>Internal Audit</option>
                <option>Forensic</option>
                <option>IFC Testing</option>
                <option>Management Consultancy</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
