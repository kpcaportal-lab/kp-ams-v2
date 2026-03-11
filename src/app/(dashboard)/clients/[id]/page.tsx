'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Building2, Phone, Mail, Users, Briefcase, FileText,
  CheckCircle, Clock, Calendar, Globe, Edit2
} from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useProposalStore } from '@/store/proposalStore';
import { SUBCATEGORY_LABELS, ASSIGNMENT_TYPE_LABELS, formatDate, formatCurrency } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  const { assignments } = useAssignmentStore();
  const { proposals } = useProposalStore();

  const client = clients.find(c => c.id === id);

  // Filter assignments and proposals for this client
  const clientAssignments = assignments.filter(a => a.client_id === id);
  const clientProposals = proposals.filter(p => p.client_id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Building2 size={48} className="text-slate-300" />
        <p className="text-lg font-semibold text-slate-500">Client not found</p>
        <button onClick={() => router.push('/clients')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Back to Clients
        </button>
      </div>
    );
  }

  const statusBadge = client.status === 'active' ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      <CheckCircle size={13} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-500 border border-slate-300/40">
      Inactive
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={() => router.push('/clients')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Clients
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{client.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">{client.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge}
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Edit2 size={14} /> Edit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">SPOC Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users size={15} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Contact Name</div>
                <div className="text-sm font-semibold text-slate-800">{client.spocName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Mail size={15} className="text-violet-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Email</div>
                <a href={`mailto:${client.spocEmail}`} className="text-sm font-semibold text-blue-600 hover:underline">{client.spocEmail}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Phone size={15} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Phone</div>
                <div className="text-sm font-semibold text-slate-800">{client.spocPhone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Engagement Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Assignments</span>
              <span className="text-sm font-bold text-slate-900">{clientAssignments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Proposals</span>
              <span className="text-sm font-bold text-slate-900">{clientProposals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Fees</span>
              <span className="text-sm font-bold text-slate-900">
                {formatIndianCurrency(clientAssignments.reduce((sum, a) => sum + a.total_fees, 0), true, true)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Active Assignments</span>
              <span className="text-sm font-bold text-emerald-600">
                {clientAssignments.filter(a => a.status === 'active').length}
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Dates</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar size={15} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Created</div>
                <div className="text-sm font-semibold text-slate-800">{formatDate(client.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock size={15} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Last Updated</div>
                <div className="text-sm font-semibold text-slate-800">{formatDate(client.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assignments Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-600" /> Assignments
          </h2>
          <span className="text-xs font-semibold text-slate-400">{clientAssignments.length} total</span>
        </div>
        {clientAssignments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No assignments for this client</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scope</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subcategory</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fees</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {clientAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/assignments/${a.id}`} className="font-semibold text-slate-800 hover:text-blue-700 transition-colors">
                        {a.scope_item || a.scope_areas || '—'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{SUBCATEGORY_LABELS[a.subcategory]}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{formatIndianCurrency(a.total_fees)}</td>
                    <td className="px-5 py-3 text-center">
                      {a.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">{a.status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{a.fiscal_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Proposals Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-violet-600" /> Proposals
          </h2>
          <span className="text-xs font-semibold text-slate-400">{clientProposals.length} total</span>
        </div>
        {clientProposals.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No proposals for this client</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Number</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {clientProposals.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/proposals/${p.id}`} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors font-mono text-xs">
                        {p.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{ASSIGNMENT_TYPE_LABELS[p.assignment_type]}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{formatIndianCurrency(p.quotation_amount)}</td>
                    <td className="px-5 py-3 text-center">
                      {p.status === 'won' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Won</span>
                      ) : p.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">Pending</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">Lost</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(p.proposal_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
