'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProposalStore } from '@/store/proposalStore';
import { useClientStore } from '@/store/clientStore';
import { useUserStore } from '@/store/userStore';
import { useTemplateStore } from '@/store/templateStore';
import { Proposal, ProposalType, AssignmentType, FeeCategory } from '@/types';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Briefcase, 
  IndianRupee, 
  ShieldCheck, 
  FileText, 
  Search,
  Sparkles,
  CheckCircle2,
  Plus,
  UserPlus,
  X,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function NewProposalPage() {
  const router = useRouter();
  const { addProposal } = useProposalStore();
  const { clients } = useClientStore();
  const { partners } = useUserStore();
  const { templates } = useTemplateStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [isSmartSuggesting, setIsSmartSuggesting] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    industry: 'Technology',
    spocName: '',
    spocEmail: '',
    spocPhone: '',
  });

  const { addClient } = useClientStore();

  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    quotation_amount: '',
    proposal_type: 'new' as ProposalType,
    assignment_type: 'internal_audit' as AssignmentType,
    fee_category: 'new' as FeeCategory,
    fiscal_year: '2025-26',
    responsible_partner: '',
    template_id: '',
    scope_areas: '',
    notes: '',
  });

  const filteredClients = useMemo(() => 
    clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase())
    ), [clients, clientSearch]
  );

  const handleSelectClient = (client: any) => {
    setFormData(prev => ({ ...prev, client_id: client.id, client_name: client.name }));
    setClientSearch(client.name);
    setShowClientResults(false);

    // Smart Auto-completion Logic
    setIsSmartSuggesting(true);
    setTimeout(() => {
      let suggestedType: AssignmentType = 'internal_audit';
      
      switch (client.industry?.toLowerCase()) {
        case 'technology':
          suggestedType = 'ifc';
          break;
        case 'logistics':
          suggestedType = 'forensic';
          break;
        case 'retail':
          suggestedType = 'mcs';
          break;
        default:
          suggestedType = 'internal_audit';
      }

      setFormData(prev => ({ ...prev, assignment_type: suggestedType }));
      setIsSmartSuggesting(false);
      toast.success(`Smart-suggested ${suggestedType.replace('_', ' ')} for ${client.industry} client`, {
        icon: '✨',
        duration: 3000,
      });
    }, 600);
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name) {
      toast.error('Client name is required');
      return;
    }

    try {
      const tempId = `c${Date.now()}`;
      addClient({
        ...newClientData,
        status: 'active',
      } as any);

      // Auto-select the new client
      setFormData(prev => ({ 
        ...prev, 
        client_id: tempId, 
        client_name: newClientData.name 
      }));
      setClientSearch(newClientData.name);
      setIsAddingClient(false);
      
      // Reset new client form
      setNewClientData({
        name: '',
        industry: 'Technology',
        spocName: '',
        spocEmail: '',
        spocPhone: '',
      });

      toast.success(`${newClientData.name} added and selected!`, {
        icon: '🏢',
      });
    } catch (error) {
      toast.error('Failed to add client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      toast.error('Please select a client');
      return;
    }
    setIsSubmitting(true);

    try {
      const selectedPartner = partners.find(p => p.id === formData.responsible_partner);

      const newProposal: Proposal = {
        id: `prop-${Math.random().toString(36).substr(2, 9)}`,
        number: `PRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        client_id: formData.client_id,
        client_name: formData.client_name,
        proposal_type: formData.proposal_type,
        assignment_type: formData.assignment_type,
        fee_category: formData.fee_category,
        quotation_amount: Number(formData.quotation_amount),
        proposal_date: new Date().toISOString(),
        prepared_by: 'current-user',
        prepared_by_name: 'Current User',
        responsible_partner: formData.responsible_partner,
        partner_name: selectedPartner?.full_name || '',
        status: 'pending',
        revision_flag: false,
        version_number: 1,
        fiscal_year: formData.fiscal_year,
        template_id: formData.template_id,
        scope_areas: formData.scope_areas,
        notes: formData.notes,
        created_at: new Date().toISOString(),
      };

      addProposal(newProposal);
      toast.success('Proposal created successfully!');
      router.push('/proposals');
    } catch (error) {
      toast.error('Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto p-4 md:p-8 space-y-8"
    >
      {/* Background Blobs for Glassmorphism Context */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/proposals" 
            className="p-2.5 hover:bg-white/80 rounded-xl transition-all text-gray-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-blue-100 hover:shadow-blue-50/50"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
              Draft Proposal
            </h1>
            <p className="text-gray-500 font-medium tracking-tight">Crafting excellence for your next engagement</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Client Selection */}
          <motion.div 
            variants={cardVariants}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 size={80} />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Client Intelligence</h2>
                <p className="text-xs text-gray-500 font-medium">Select the target organization</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingClient(true)}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm shadow-blue-100/50"
              >
                <PlusCircle size={16} />
                New Client
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Search Database</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-blue-500 transition-colors">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none text-gray-900 placeholder:text-gray-300 font-medium"
                    placeholder="Search by name or industry..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientResults(true);
                    }}
                    onFocus={() => setShowClientResults(true)}
                  />
                  
                  <AnimatePresence>
                    {showClientResults && clientSearch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden max-h-72 overflow-y-auto"
                      >
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            className="w-full text-left px-6 py-4 hover:bg-blue-50/50 transition-all border-b last:border-0 border-gray-50 flex items-center justify-between group/row"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div>
                              <div className="font-bold text-gray-900 group-hover/row:text-blue-700 transition-colors uppercase text-sm tracking-tight">{client.name}</div>
                              <div className="text-xs text-gray-400 font-semibold">{client.industry}</div>
                            </div>
                            <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <CheckCircle2 className="text-blue-500" size={18} />
                            </div>
                          </button>
                        ))}
                        {filteredClients.length === 0 && (
                          <div className="px-6 py-8 text-sm text-gray-400 text-center font-medium italic">
                            No matching clients found
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section: Scope & Engagement */}
          <motion.div 
            variants={cardVariants}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={80} />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
                <Briefcase size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Engagement Strategic Details</h2>
                <p className="text-xs text-gray-500 font-medium">Define the core mission and scope</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Type of Engagement</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none appearance-none cursor-pointer font-medium transition-all"
                    value={formData.proposal_type}
                    onChange={(e) => setFormData({ ...formData, proposal_type: e.target.value as ProposalType })}
                  >
                    <option value="new">New Strategic Engagement</option>
                    <option value="renewal">Renewal / Continuity</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Primary Specialization
                    {isSmartSuggesting && (
                      <motion.span 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={14} className="text-blue-500" />
                      </motion.span>
                    )}
                  </label>
                  <div className="relative">
                    <select 
                      className={cn(
                        "w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none appearance-none cursor-pointer font-bold transition-all",
                        isSmartSuggesting ? "opacity-50 grayscale" : "opacity-100"
                      )}
                      value={formData.assignment_type}
                      onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value as AssignmentType })}
                    >
                      <option value="internal_audit">Internal Audit</option>
                      <option value="forensic">Forensic Investigation</option>
                      <option value="overseas">Overseas (Africa)</option>
                      <option value="mcs">Management Consultancy</option>
                      <option value="ifc">IFC Testing</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ArrowLeft className="-rotate-90" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Critical Workstreams (Scope)</label>
                <textarea 
                  rows={6}
                  className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none resize-none font-medium text-gray-700 leading-relaxed placeholder:text-gray-300"
                  placeholder="Identify core focus areas...&#10;• Operational Efficiency Review&#10;• Compliance Framework Matrix&#10;• Risk Assessment & Mitigation"
                  value={formData.scope_areas}
                  onChange={(e) => setFormData({ ...formData, scope_areas: e.target.value })}
                />
                <div className="flex items-center gap-2 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Auto-formatting enabled for PDF generation</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Side Controls */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section: Investment & Terms */}
          <motion.div 
            variants={cardVariants}
            className="group bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg shadow-green-200">
                <IndianRupee size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Investment</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Proposed Fee (LPA)</label>
                <div className="relative group/curr">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/curr:text-green-600 transition-colors">
                    <IndianRupee size={18} />
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-bold text-lg text-gray-900"
                    placeholder="0.00"
                    value={formData.quotation_amount}
                    onChange={(e) => setFormData({ ...formData, quotation_amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Fee Model</label>
                <select 
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-400 outline-none font-medium cursor-pointer transition-all"
                  value={formData.fee_category}
                  onChange={(e) => setFormData({ ...formData, fee_category: e.target.value as FeeCategory })}
                >
                  <option value="new">Standard Engagement Fee</option>
                  <option value="continuation">Flat Continuation</option>
                  <option value="increment">Performance Incremented</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3">Fiscal Cycle</label>
                <div className="flex flex-wrap gap-2">
                  {['2024-25', '2025-26', '2026-27'].map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setFormData({ ...formData, fiscal_year: year })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        formData.fiscal_year === year 
                          ? "bg-gray-900 text-white shadow-lg" 
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      FY {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section: Authority & Template */}
          <motion.div 
            variants={cardVariants}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200">
                <ShieldCheck size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Governance</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Engaging Partner</label>
                <select 
                  required
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-medium transition-all"
                  value={formData.responsible_partner}
                  onChange={(e) => setFormData({ ...formData, responsible_partner: e.target.value })}
                >
                  <option value="">Choose Partner</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Visual Architecture</label>
                <select 
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-medium transition-all"
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                >
                  <option value="">Classic Firm Standard</option>
                  {templates.filter(t => t.assignment_type === formData.assignment_type).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={cardVariants}
            className="flex flex-col gap-4 pt-4"
          >
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold shadow-[0_12px_40px_-12px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              {isSubmitting ? 'Architecting...' : 'Finalize Strategy Draft'}
            </button>
            <Link href="/proposals" className="w-full py-5 text-gray-400 font-bold text-center hover:text-gray-600 transition-colors tracking-tight">
              Cancel Strategy
            </Link>
          </motion.div>

        </div>
      </form>

      {/* Quick Add Client Modal */}
      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingClient(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Rapid Onboarding</h2>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Add new client to ecosystem</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddingClient(false)}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleQuickAddClient} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Entity Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-gray-900 transition-all"
                        placeholder="Company Name Ltd."
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Industry Sector</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none font-bold text-gray-900 cursor-pointer appearance-none transition-all"
                        value={newClientData.industry}
                        onChange={(e) => setNewClientData({ ...newClientData, industry: e.target.value })}
                      >
                        <option value="Technology">Technology</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Banking">Banking</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other Sector</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">SPOC Details (Primary Contact)</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text"
                          className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:border-blue-400 outline-none font-medium text-gray-900 shadow-sm"
                          placeholder="Contact Person Name"
                          value={newClientData.spocName}
                          onChange={(e) => setNewClientData({ ...newClientData, spocName: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input 
                            type="email"
                            className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:border-blue-400 outline-none font-medium text-gray-900 shadow-sm"
                            placeholder="email@company.com"
                            value={newClientData.spocEmail}
                            onChange={(e) => setNewClientData({ ...newClientData, spocEmail: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input 
                            type="text"
                            className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:border-blue-400 outline-none font-medium text-gray-900 shadow-sm"
                            placeholder="+91 XXXXX XXXXX"
                            value={newClientData.spocPhone}
                            onChange={(e) => setNewClientData({ ...newClientData, spocPhone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      Authenticate and Add Client
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAddingClient(false)}
                      className="px-8 py-5 border border-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
