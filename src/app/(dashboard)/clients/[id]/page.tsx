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
import { motion, AnimatePresence } from 'framer-motion';
import EditClientModal from '@/components/modals/EditClientModal';

export default function ClientDetailPage() {
  const { id } = useParams();
  const clientId = id as string;
  const router = useRouter();
  const { clients } = useClientStore();
  const { assignments } = useAssignmentStore();
  const { proposals } = useProposalStore();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const client = clients.find(c => c.id === clientId);

  // Filter assignments and proposals for this client
  const clientAssignments = assignments.filter(a => a.client_id === clientId);
  const clientProposals = proposals.filter(p => p.client_id === clientId);

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{client.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-400 font-medium">{client.industry}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                {statusBadge}
              </div>
            </div>
          </div>
          <button onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Edit2 size={16} /> Edit Client
          </button>
        </div>
      </motion.div>

      {/* KPI + Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SPOC Name</div>
                  <div className="text-sm font-semibold text-slate-800">{client.spocName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SPOC Email</div>
                  <div className="text-sm font-semibold text-slate-800">{client.spocEmail}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SPOC Phone</div>
                  <div className="text-sm font-semibold text-slate-800">{client.spocPhone}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Created At</div>
                  <div className="text-sm font-semibold text-slate-800">{formatDate(client.created_at)}</div>
                </div>
              </div>
            </div>
          </div>
          {client.gstn && (
            <div className="mt-6 pt-5 border-t border-slate-100/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GSTN</div>
                <div className="text-sm font-medium text-slate-600 leading-relaxed">{client.gstn}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4">
          <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{clientAssignments.length}</div>
              <div className="text-xs font-bold text-blue-600/70 uppercase tracking-wide mt-1">Assignments</div>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-violet-100 bg-violet-50/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{clientProposals.length}</div>
              <div className="text-xs font-bold text-violet-600/70 uppercase tracking-wide mt-1">Proposals</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Assignments Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-600" /> Active Assignments
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
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project / Scope</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fees</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fiscal Year</th>
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

      <AnimatePresence>
        {isEditModalOpen && (
          <EditClientModal
            client={client}
            open={isEditModalOpen}
            setOpen={setIsEditModalOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
