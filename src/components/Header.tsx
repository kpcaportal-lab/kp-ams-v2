'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, User as UserIcon, Menu, Bell, ChevronRight, LifeBuoy, Plus, X } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { cn } from '@/lib/utils';
import { useTicketStore } from '@/store/ticketStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
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

        {/* Search - Expandable on focus */}
        <div className="relative group hidden lg:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-48 focus:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-700"
          />
        </div>

        <NotificationCenter />

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
