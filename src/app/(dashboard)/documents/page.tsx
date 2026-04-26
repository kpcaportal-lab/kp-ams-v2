'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, Search, Download, Eye, 
  ChevronRight, ChevronDown, Filter, Shield, 
  HardDrive, ExternalLink, X
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Doc {
  id: string;
  client_name: string;
  title: string;
  file_url: string;
  fiscal_year: string;
  category: string;
}

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<Record<string, Doc[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/documents');
      setDocuments(res.data);
      // Auto-expand first few clients
      const firstClients = Object.keys(res.data).slice(0, 3);
      setExpandedClients(new Set(firstClients));
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to load document vault');
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const filteredClients = Object.keys(documents).filter(clientName => 
    clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    documents[clientName].some(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Securing access to vault...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            Document <span className="text-indigo-600">Vault</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Secure repository for audit working papers and reports</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search clients or files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Stats/Folders sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-800 rounded-lg">
                <HardDrive className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="font-black tracking-tight">Vault Storage</div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <span>Capacity Used</span>
                  <span>42%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[42%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="text-xl font-black text-white">{Object.keys(documents).length}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Clients</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="text-xl font-black text-white">{Object.values(documents).flat().length}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Total Files</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Quick Filters</div>
            <div className="space-y-1">
              {['Audit Reports', 'Signed LOEs', 'Working Papers', 'Misc'].map(filter => (
                <button key={filter} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-3">
                  <Folder className="w-4 h-4 text-slate-300" />
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - File Browser */}
        <div className="lg:col-span-3 space-y-4">
          {filteredClients.map((clientName) => {
            const isExpanded = expandedClients.has(clientName);
            const clientDocs = documents[clientName];

            return (
              <div key={clientName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleClient(clientName)}
                  className={cn(
                    "w-full flex items-center justify-between p-5 text-left transition-colors",
                    isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all",
                      isExpanded ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400"
                    )}>
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight leading-none mb-1">{clientName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{clientDocs.length} files available</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 overflow-hidden"
                    >
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/30">
                        {clientDocs.map((doc) => (
                          <div 
                            key={doc.id}
                            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-rose-50 text-rose-500 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-sm font-black text-slate-800 truncate" title={doc.title}>{doc.title}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{doc.fiscal_year} • {doc.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setPreviewUrl(doc.file_url)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Quick Preview"
                              >
                                <Eye size={18} />
                              </button>
                              <a 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Download"
                              >
                                <Download size={18} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-300 p-20 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Folder className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-black text-slate-900">No folders found</h3>
               <p className="text-slate-500 mt-2 font-medium italic">Try adjusting your search query or check another fiscal year</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setPreviewUrl(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-full h-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Shield size={20} />
                </div>
                <div className="font-black text-slate-900 tracking-tight">Vault Preview Mode</div>
              </div>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-2.5 rounded-full bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-slate-800">
               <iframe 
                src={previewUrl} 
                className="w-full h-full border-none"
                title="Document Preview"
               />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
