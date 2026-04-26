'use client';

import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  eachDayOfInterval, isToday, parseISO
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, CheckCircle, FileText, Receipt, Filter, Plus, Info
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'proposal' | 'billing';
  status?: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/calendar/events');
      setEvents(res.data.events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      toast.error('Failed to load audit calendar');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), day))
      .filter(event => filterType === 'all' || event.type === filterType);
  };

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'proposal': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'billing': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <CheckCircle size={10} />;
      case 'proposal': return <FileText size={10} />;
      case 'billing': return <Receipt size={10} />;
      default: return <Clock size={10} />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading strategic calendar...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl shadow-lg">
              <CalendarIcon className="text-white w-6 h-6" />
            </div>
            Audit Lifecycle <span className="text-blue-600">Calendar</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Monitor deadlines, proposals, and billing cycles</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {['all', 'assignment', 'proposal', 'billing'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  filterType === type 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        
        {/* Calendar Toolbar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 grid-rows-5 h-[800px]">
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const isSelectedMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "relative p-3 border-r border-b border-slate-50 transition-colors group",
                  !isSelectedMonth ? "bg-slate-50/50" : "bg-white",
                  isToday(day) ? "bg-blue-50/30" : ""
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center text-sm font-black rounded-full transition-all",
                    isToday(day) ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : 
                    isSelectedMonth ? "text-slate-900 group-hover:bg-slate-100" : "text-slate-300"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-hide">
                  {dayEvents.map((event, idx) => (
                    <div 
                      key={`${event.id}-${idx}`}
                      className={cn(
                        "p-1.5 rounded-lg border text-[10px] font-bold truncate flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer",
                        getEventStyles(event.type)
                      )}
                      title={event.title}
                    >
                      {getEventIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center pt-4">
        {[
          { label: 'Assignments', color: 'bg-blue-500', icon: CheckCircle },
          { label: 'Proposals', color: 'bg-amber-500', icon: FileText },
          { label: 'Billing Cycles', color: 'bg-emerald-500', icon: Receipt },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className={cn("w-3 h-3 rounded-full", item.color)} />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
