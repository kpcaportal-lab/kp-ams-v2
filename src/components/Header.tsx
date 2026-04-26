'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, User as UserIcon, Menu, Bell, ChevronRight, LifeBuoy, Plus, X, Users } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { cn } from '@/lib/utils';
import { useTicketStore } from '@/store/ticketStore';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface SearchResultSet {
  clients: any[];
  assignments: any[];
  proposals: any[];
  invoices: any[];
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loginAs } = useAuthStore();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  // Impersonation state
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
  const [impersonationList, setImpersonationList] = useState<any[]>([]);
  const [impersonationLoading, setImpersonationLoading] = useState(false);
  const impersonateRef = useRef<HTMLDivElement>(null);

  // Close impersonate on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (impersonateRef.current && !impersonateRef.current.contains(e.target as Node)) {
        setIsImpersonateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch impersonation list
  useEffect(() => {
    if (isImpersonateOpen && ['admin', 'partner', 'director'].includes(user?.role || '') && impersonationList.length === 0) {
      setImpersonationLoading(true);
      api.get('/api/users/impersonation-list')
        .then(res => setImpersonationList(res.data))
        .catch(err => console.error('Failed to fetch impersonation list', err))
        .finally(() => setImpersonationLoading(false));
    }
  }, [isImpersonateOpen, user?.role, impersonationList.length]);

  const handleImpersonate = async (id: string) => {
    try {
      await loginAs(id);
      setIsImpersonateOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      alert('Failed to impersonate user');
    }
  };
  
  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultSet | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Ticket form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('Image must be smaller than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await useTicketStore.getState().createTicket({ title, description, priority, attachment_url: attachment || undefined });
      setIsTicketModalOpen(false);
      setTitle('');
      setDescription('');
      setPriority('low');
      setAttachment(null);
      alert('Ticket submitted successfully!');
    } catch (error) {
      console.error('Failed to create ticket', error);
    } finally {
      setCreating(false);
    }
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return (
        <span key={part} className="flex items-center">
          <span className={cn(
            "text-sm font-medium transition-colors",
            isLast ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
          )}>
            {label}
          </span>
          {!isLast && <ChevronRight size={14} className="mx-2 text-slate-300" />}
        </span>
      );
    });
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full h-[72px] flex items-center justify-between px-6 bg-white/70 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        
        <nav className="hidden md:flex items-center">
          {getBreadcrumbs()}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Support Ticket Button */}
        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <LifeBuoy size={14} />
          Raise Ticket
        </button>

        {/* Search - Expandable on focus with live results */}
        <div className="relative group hidden lg:block" ref={searchRef}>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="w-48 focus:w-72 h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-700"
          />
          
          <AnimatePresence>
            {isSearchOpen && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute top-full right-0 mt-2 w-[420px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[200]"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                    {searchLoading ? 'Searching...' : 'Search Results'}
                  </span>
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">Searching...</p>
                    </div>
                  ) : !searchResults ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium">Type to search...</div>
                  ) : (searchResults.clients.length + searchResults.assignments.length + searchResults.proposals.length + searchResults.invoices.length) === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium italic">No results found for &ldquo;{searchQuery}&rdquo;</div>
                  ) : (
                    <>
                      {searchResults.clients.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Clients</div>
                          {searchResults.clients.map((c: any) => (
                            <button key={c.id} onClick={() => { router.push(`/clients/${c.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors text-left border-b border-slate-50 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black">{c.name?.charAt(0)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{c.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{c.gstn || 'No GSTN'}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.assignments.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Assignments</div>
                          {searchResults.assignments.map((a: any) => (
                            <button key={a.id} onClick={() => { router.push(`/assignments/${a.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/50 transition-colors text-left border-b border-slate-50 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-black">{a.proposal_number?.slice(-2) || 'AS'}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{a.client_name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{a.proposal_number || 'No ID'}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.proposals.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Proposals</div>
                          {searchResults.proposals.map((p: any) => (
                            <button key={p.id} onClick={() => { router.push(`/proposals/${p.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50/50 transition-colors text-left border-b border-slate-50 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 text-xs font-black">{p.number?.slice(-2) || 'PR'}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{p.client_name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{p.number}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.invoices.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Invoices</div>
                          {searchResults.invoices.map((inv: any) => (
                            <button key={inv.id} onClick={() => { router.push(`/assignments/${inv.assignment_id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50/50 transition-colors text-left border-b border-slate-50 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-xs font-black">#{inv.sr_no}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{inv.client_name}</div>
                                <div className="text-[10px] text-slate-400 font-medium truncate">{inv.narration?.slice(0, 50)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NotificationCenter />
        
        {/* View As Dropdown */}
        {['admin', 'partner', 'director'].includes(user?.role || '') && (
          <div className="relative" ref={impersonateRef}>
            <button
              onClick={() => setIsImpersonateOpen(!isImpersonateOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="View As"
            >
              <Users size={16} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700 hidden sm:block">View As</span>
            </button>
            
            <AnimatePresence>
              {isImpersonateOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[200]"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                      Impersonate User
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {impersonationLoading ? (
                      <div className="text-center py-4">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      </div>
                    ) : impersonationList.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 font-medium italic">No users available</div>
                    ) : (
                      impersonationList.map((impUser: any) => (
                        <button
                          key={impUser.id}
                          onClick={() => handleImpersonate(impUser.id)}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex flex-col"
                        >
                          <span className="text-sm font-bold text-slate-800">{impUser.full_name}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">{impUser.role}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Profile */}
        <div 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {user?.full_name || 'Guest User'}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {user?.role || 'Viewer'}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              {user?.full_name ? user.full_name.charAt(0) : <UserIcon size={20} />}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>

    {/* Global Ticket Modal */}
    <AnimatePresence>
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsTicketModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <LifeBuoy size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Support Center</h2>
                  <p className="text-[11px] text-slate-500 font-medium">How can we help you today?</p>
                </div>
              </div>
              <button onClick={() => setIsTicketModalOpen(false)} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Issue Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Short summary..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Describe the problem</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} placeholder="Provide details..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Proof (Optional)</label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="header-ticket-file" />
                    <label htmlFor="header-ticket-file" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-500 cursor-pointer hover:bg-white hover:border-blue-400 transition-all">
                      <Plus size={16} /> {attachment ? 'Image Selected' : 'Upload Screenshot'}
                    </label>
                    {attachment && <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm"><img src={attachment} className="w-full h-full object-cover" /></div>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsTicketModalOpen(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50">
                  {creating ? 'Sending...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
