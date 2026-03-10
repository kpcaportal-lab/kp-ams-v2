'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProposalStore } from '@/store/proposalStore';
import { 
  ArrowLeft, CheckCircle2, Clock, FileText, Send, User, 
  Calendar, Edit, XCircle, History, RotateCcw, 
  Download, Briefcase, IndianRupee, MapPin, 
  Building2, Users, FileCheck, Layers, Presentation, AlertCircle, Plus
} from 'lucide-react';
import { formatCurrency, formatDate, ASSIGNMENT_TYPE_LABELS, ProposalStatus } from '@/types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import { mapProposalToAssignments } from '@/lib/assignmentMapper';

export default function ProposalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { proposals, updateProposalStatus, reviseProposal } = useProposalStore();
  
  const [isRevisionModalOpen, setIsRevisionModalOpen] = React.useState(false);
  const [revisionDetails, setRevisionDetails] = React.useState('');
  const [revisedFee, setRevisedFee] = React.useState(0);

  const proposal = proposals.find(p => p.id === params.id);

  React.useEffect(() => {
    if (proposal) {
      setRevisedFee(proposal.revised_fee || proposal.quotation_amount);
    }
  }, [proposal]);

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-red-50 text-red-600 rounded-full mb-4"
        >
          <XCircle size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Proposal Not Found</h2>
        <p className="text-slate-500 mb-6">The proposal you are looking for does not exist or has been removed.</p>
        <button className="btn btn-secondary px-8 font-bold" onClick={() => router.push('/proposals')}>Back to Proposals</button>
      </div>
    );
  }

  const handleRevise = () => {
    if (revisionDetails) {
      reviseProposal(proposal.id, revisionDetails, revisedFee);
      setIsRevisionModalOpen(false);
      setRevisionDetails('');
      toast.success('Revision v' + (proposal.version_number + 1) + ' Generated');
    }
  };

  const handleStatusUpdate = async (newStatus: ProposalStatus) => {
    const loadingToast = toast.loading(`Updating status to ${newStatus.toUpperCase()}...`);
    try {
      if (newStatus === 'won') {
        const assignments = mapProposalToAssignments(proposal);
        // Logic to save assignments would go here if we had an assignment store
        // For now, we update the status and notify the user
        toast.success(`Proposal won! Generated ${assignments.length} assignments.`, { id: loadingToast });
      } else if (newStatus === 'lost') {
        toast.success('Proposal marked as lost.', { id: loadingToast });
      } else {
        toast.success(`Status reset to ${newStatus}.`, { id: loadingToast });
      }
      updateProposalStatus(proposal.id, newStatus);
    } catch (error) {
      console.error('Status Update Error:', error);
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('proposal-content');
    if (!element) return;

    const loadingToast = toast.loading('Architecting PDF...');
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Proposal_${proposal.number}_${(proposal.client_name || 'Client').replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Professional PDF Generated', { id: loadingToast });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('PDF Generation Failed', { id: loadingToast });
    }
  };

  const handleExportPPTX = () => {
    const loadingToast = toast.loading('Generating PPTX Deck...');
    
    try {
      const pres = new pptxgen();
      
      // 1. Title Slide
      const slide1 = pres.addSlide();
      slide1.background = { color: "0F172A" }; // Slate-900
      
      slide1.addText("BUSINESS PROPOSAL", {
        x: '10%', y: '35%', w: '80%',
        fontSize: 36, bold: true, color: "FFFFFF", align: pres.AlignH.left
      });
      
      slide1.addText((proposal?.client_name || "CLIENT").toUpperCase(), {
        x: '10%', y: '45%', w: '80%',
        fontSize: 48, bold: true, color: "3B82F6", align: pres.AlignH.left
      });
      
      slide1.addText(`PROPOSAL NO: ${proposal?.number} | VERSION ${proposal?.version_number}`, {
        x: '10%', y: '60%', w: '80%',
        fontSize: 14, color: "94A3B8", align: pres.AlignH.left
      });

      // 2. Executive Summary
      const slide2 = pres.addSlide();
      slide2.addText("EXECUTIVE OVERVIEW", {
        x: 0.5, y: 0.5, w: '90%',
        fontSize: 24, bold: true, color: "0F172A"
      });
      
      pres.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
      
      const tableData = [
        [
          { text: "Strategic Attribute", options: { bold: true, color: "FFFFFF", fill: { color: "0F172A" } } }, 
          { text: "Value Distribution", options: { bold: true, color: "FFFFFF", fill: { color: "0F172A" } } }
        ],
        [ { text: "Client Entity" }, { text: proposal?.client_name || "N/A" } ],
        [ { text: "Assignment Classification" }, { text: proposal ? ASSIGNMENT_TYPE_LABELS[proposal.assignment_type] : "N/A" } ],
        [ { text: "Strategic Nature" }, { text: `${proposal?.proposal_type} Engagement` } ],
        [ { text: "Quotation Value" }, { text: proposal ? formatCurrency(proposal.quotation_amount) : "N/A" } ],
        [ { text: "Lead Partner" }, { text: proposal?.partner_name || "Unassigned" } ],
        [ { text: "Manager In-Charge" }, { text: proposal?.prepared_by_name || "Unassigned" } ]
      ];
      
      // @ts-ignore - Handle complex type mismatch for rapid building
      slide2.addTable(tableData as any, { x: 0.5, y: 1.2, w: 9, rowH: 0.4, fontSize: 12, border: { pt: 1, color: "E2E8F0" } });

      // 3. Scope of Work
      const slide3 = pres.addSlide();
      slide3.addText("SCOPE OF GOVERNANCE", {
        x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "0F172A"
      });
      
      slide3.addText(proposal.notes || "Standard engagement protocols apply correctly and specifically to the provided scope areas. All deliverables are subject to the master services agreement.", {
        x: 0.5, y: 1.2, w: 9, h: 3, fontSize: 14, color: "475569", align: pres.AlignH.left, valign: pres.AlignV.top
      });

      pres.writeFile({ fileName: `Proposal_${proposal.number}_Deck.pptx` });
      toast.success('Professional Deck Exported', { id: loadingToast });
    } catch (error) {
      console.error('PPTX Generation Error:', error);
      toast.error('PPTX Generation Failed', { id: loadingToast });
    }
  };

  const allVersions = proposals
    .filter(p => 
      p.id === proposal.id || 
      p.parent_proposal_id === (proposal.parent_proposal_id || proposal.id) ||
      (proposal.parent_proposal_id && p.id === proposal.parent_proposal_id)
    )
    .sort((a, b) => b.version_number - a.version_number);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto flex flex-col gap-6 pb-20 relative px-4 sm:px-0"
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation Breadcrumb & Actions */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/60 pb-8">
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push('/proposals')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-all text-xs font-bold uppercase tracking-widest w-fit group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">{proposal.client_name}</h1>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
              proposal.status === 'won' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              proposal.status === 'lost' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {proposal.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200/50">
              <FileText size={14} className="text-slate-400" />
              <span className="font-mono tracking-tighter">{proposal.number}</span>
            </div>
            <div className="h-4 w-[1.5px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Layers size={14} className="text-slate-400" />
              <span>Version {proposal.version_number}</span>
            </div>
            <div className="h-4 w-[1.5px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>{formatDate(proposal.proposal_date)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-95"
          >
            <Download size={18} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
            Download
          </button>
          
          <button 
            onClick={handleExportPPTX}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-95"
          >
            <Presentation size={18} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
            PPT Deck
          </button>

          {proposal.status === 'pending' && (
            <>
              <button 
                onClick={() => handleStatusUpdate('won')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 border border-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                <CheckCircle2 size={18} />
                Mark as Won
              </button>
              <button 
                onClick={() => handleStatusUpdate('lost')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 px-5 py-3 rounded-xl text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95"
              >
                <XCircle size={18} />
                Lost
              </button>
            </>
          )}

          <button 
            onClick={() => setIsRevisionModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <RotateCcw size={18} />
            Revise
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
            <Send size={18} />
            Email
          </button>
        </div>
      </motion.div>

      {/* Decision Bar */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/40 backdrop-blur-2xl border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-200">
            <FileCheck size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Decision Matrix</p>
            <p className="text-sm font-bold text-slate-800 tracking-tight">Transition proposal status or initiate service delivery workflows.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {proposal.status !== 'won' && (
            <button 
              onClick={() => handleStatusUpdate('won')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 size={14} /> Won
            </button>
          )}
          {proposal.status !== 'lost' && (
            <button 
              onClick={() => handleStatusUpdate('lost')}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-100 flex items-center gap-2 active:scale-95"
            >
              <XCircle size={14} /> Lost
            </button>
          )}
          {proposal.status === 'won' && (
            <button 
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-100 flex items-center gap-2 active:scale-95"
              onClick={() => toast.success('Assignments Generated!')}
            >
              <RotateCcw size={14} /> Assignments
            </button>
          )}
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <button 
            onClick={() => handleStatusUpdate('pending')}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* Main Content Area - Printable */}
      <div id="proposal-content" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detail Cards */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Financials Overview */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 p-20 opacity-[0.03] text-slate-900 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <IndianRupee size={200} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <IndianRupee size={16} className="text-primary-600" /> Commercial Structure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-primary-100 group/fin">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover/fin:text-primary-600 transition-colors">Quotation Amount</p>
                <p className="text-2xl md:text-3xl font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(proposal.quotation_amount)}</p>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-primary-100 group/fin">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover/fin:text-primary-600 transition-colors">Fee Category</p>
                <p className="text-xl font-black text-slate-800 uppercase tracking-tight">{proposal.fee_category}</p>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-primary-100 group/fin">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover/fin:text-primary-600 transition-colors">Fiscal Year</p>
                <p className="text-xl font-black text-slate-800">{proposal.fiscal_year}</p>
              </div>
            </div>

            {proposal.revision_flag && (
              <div className="mt-8 p-6 bg-amber-50/50 border border-amber-100 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-700 shadow-sm">
                    <History size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-2">Revision Insights (v{proposal.version_number})</h4>
                    <p className="text-sm text-amber-800 leading-relaxed font-semibold italic">"{proposal.revision_details || proposal.increment_details}"</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-amber-200/50 rounded-full text-xs font-black text-amber-900 border border-amber-300/50 shadow-sm">
                      <IndianRupee size={12} />
                      Adjusted Fee: {formatCurrency(proposal.revised_fee || proposal.quotation_amount)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Scope Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Briefcase size={16} className="text-primary-600" /> Executive Scope
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Classification</p>
                <p className="text-slate-900 font-bold text-lg leading-tight">{ASSIGNMENT_TYPE_LABELS[proposal.assignment_type]}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Nature</p>
                <p className="text-slate-900 font-bold text-lg leading-tight uppercase">{proposal.proposal_type} Engagement</p>
              </div>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/80 p-6 rounded-2xl border border-slate-100 font-medium border-l-4 border-l-primary-500">
              {proposal.notes || "Scope details are standardized according to internal regulatory engagement protocols."}
            </div>
          </motion.div>

          {/* Versions Table */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <History size={16} className="text-primary-600" /> Historical Traceability
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Version</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Valuation</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allVersions.map((v) => (
                    <tr key={v.id} className={`group hover:bg-slate-50 transition-all ${v.id === proposal.id ? 'bg-primary-50/30' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${v.id === proposal.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {v.version_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 font-mono">
                        {formatCurrency(v.revised_fee || v.quotation_amount)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border shadow-sm ${
                          v.status === 'won' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          v.status === 'lost' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-400">
                        {formatDate(v.updated_at || v.created_at)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {v.id !== proposal.id && (
                          <button 
                            onClick={() => router.push(`/proposals/${v.id}`)}
                            className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                          >
                            Inspection
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
              <Users size={16} className="text-primary-600" /> Internal Governance
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                  {proposal.partner_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Partner</p>
                  <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{proposal.partner_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-black text-2xl shadow-sm">
                  {proposal.prepared_by_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proposal Architect</p>
                  <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{proposal.prepared_by_name}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Building2 size={16} className="text-primary-600" /> Client Intelligence
            </h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Institutional Record</p>
                <p className="text-base font-black text-slate-900 tracking-tight">{proposal.client_name}</p>
              </div>
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tax Identification</p>
                <p className="text-xs font-mono font-black text-slate-800 tracking-tight">{proposal.client_gstn || "09AAFCSXXXXX1ZA"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Revision Modal */}
      <AnimatePresence>
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRevisionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Generate Revision v{proposal.version_number + 1}</h3>
                </div>
                <button onClick={() => setIsRevisionModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-900 hover:text-white transition-all">
                  <ArrowLeft size={20} className="rotate-45" />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Draft Revision Mandate</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none resize-none min-h-[140px]" 
                    placeholder="Describe specific adjustments made..."
                    value={revisionDetails}
                    onChange={(e) => setRevisionDetails(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Consolidated Value Correction (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300">
                      <IndianRupee size={24} />
                    </div>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-6 pl-16 pr-6 text-3xl font-black text-slate-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none" 
                      value={revisedFee}
                      onChange={(e) => setRevisedFee(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <button 
                    className="py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-3xl transition-all uppercase tracking-[0.2em]"
                    onClick={() => setIsRevisionModalOpen(false)}
                  >
                    Abort
                  </button>
                  <button 
                    className="py-5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-3xl transition-all uppercase tracking-[0.2em] shadow-xl shadow-primary-200 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                    onClick={handleRevise}
                    disabled={!revisionDetails}
                  >
                    <RotateCcw size={18} /> Deploy v{proposal.version_number + 1}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
