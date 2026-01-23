
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Wrench,
  Filter
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Types ---
interface RepairEvent {
  id: string;
  customer: string;
  device: string;
  status: 'Open' | 'In Progress' | 'Waiting' | 'Completed';
  technician: string;
  date: string; // YYYY-MM-DD
  time: string;
}

// --- Mock Data ---
const TECHNICIANS = [
  { label: 'All Technicians', value: 'All' },
  { label: 'Alex Morgan', value: 'Alex Morgan' },
  { label: 'Sarah Chen', value: 'Sarah Chen' },
  { label: 'Mike Ross', value: 'Mike Ross' }
];

const INITIAL_EVENTS: RepairEvent[] = [
  { id: 'REP-101', customer: 'John Doe', device: 'iPhone 14', status: 'In Progress', technician: 'Alex Morgan', date: '2025-05-20', time: '10:00 AM' },
  { id: 'REP-102', customer: 'Jane Smith', device: 'MacBook Pro', status: 'Waiting', technician: 'Sarah Chen', date: '2025-05-20', time: '02:00 PM' },
  { id: 'REP-103', customer: 'Bob Lee', device: 'iPad Air', status: 'Completed', technician: 'Alex Morgan', date: '2025-05-18', time: '09:00 AM' },
  { id: 'REP-104', customer: 'Alice Wu', device: 'Samsung S23', status: 'Open', technician: 'Mike Ross', date: '2025-05-22', time: '11:00 AM' },
  { id: 'REP-105', customer: 'Tom Hardy', device: 'Pixel 7', status: 'In Progress', technician: 'Sarah Chen', date: '2025-05-22', time: '03:00 PM' },
  { id: 'REP-106', customer: 'Chris Evans', device: 'Xbox Series X', status: 'Open', technician: 'Unassigned', date: '2025-05-25', time: '10:00 AM' },
];

export const RepairCalendar = () => {
  const navigate = useNavigate();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<RepairEvent[]>(INITIAL_EVENTS);
  const [selectedTech, setSelectedTech] = useState('All');
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('eventId', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      setEvents(prev => prev.map(ev => 
        ev.id === eventId ? { ...ev, date: targetDate } : ev
      ));
      // Optionally show toast "Rescheduled"
    }
  };

  // Filtering
  const filteredEvents = useMemo(() => {
    return events.filter(ev => selectedTech === 'All' || ev.technician === selectedTech);
  }, [events, selectedTech]);

  // Render Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-brand/20 text-brand border-brand/30';
      case 'In Progress': return 'bg-warning/20 text-warning border-warning/30';
      case 'Waiting': return 'bg-danger/20 text-danger border-danger/30';
      case 'Completed': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-white/10 text-zinc-muted';
    }
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Padding for prev month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-obsidian-outer/30 border border-white/[0.02]" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(ev => ev.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const isSelected = selectedDate === dateStr;

      days.push(
        <div 
          key={day} 
          className={cn(
            "min-h-[120px] border border-white/5 p-2 relative transition-all group",
            isSelected ? "bg-white/[0.03] ring-1 ring-inset ring-brand/20" : "bg-obsidian-panel",
            isToday && "bg-brand/[0.02]"
          )}
          onClick={() => handleDateClick(year, month, day)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateStr)}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={cn(
              "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
              isToday ? "bg-brand text-obsidian-outer" : "text-zinc-muted group-hover:text-zinc-text"
            )}>
              {day}
            </span>
            {dayEvents.length > 0 && (
                <span className="text-[8px] font-black text-zinc-muted bg-white/5 px-1.5 rounded">{dayEvents.length}</span>
            )}
          </div>
          
          <div className="space-y-1.5">
            {dayEvents.map(ev => (
              <div 
                key={ev.id}
                draggable
                onDragStart={(e) => handleDragStart(e, ev.id)}
                onClick={(e) => { e.stopPropagation(); navigate(`/repairs/${ev.id}`); }}
                className={cn(
                  "p-1.5 rounded-sm border text-[9px] font-bold cursor-grab active:cursor-grabbing hover:brightness-110 transition-all",
                  getStatusColor(ev.status)
                )}
                title={`${ev.customer} - ${ev.device}`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate flex-1">{ev.device}</span>
                  {ev.technician !== 'Unassigned' && (
                    <div className="w-3 h-3 rounded-full bg-black/20 flex items-center justify-center text-[7px] font-black ml-1">
                      {ev.technician.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  const selectedDayEvents = filteredEvents.filter(ev => ev.date === selectedDate);

  return (
    <div className="animate-fade-up space-y-6 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Calendar className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Repair Schedule</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage technician workload</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
           {/* Date Nav */}
           <div className="flex items-center bg-obsidian-panel border border-white/10 rounded-sm mr-2">
              <button onClick={handlePrev} className="p-2 hover:bg-white/5 text-zinc-muted hover:text-zinc-text border-r border-white/5"><ChevronLeft className="w-4 h-4" /></button>
              <div className="px-4 py-1.5 text-xs font-bold text-zinc-text min-w-[140px] text-center">
                 {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={handleNext} className="p-2 hover:bg-white/5 text-zinc-muted hover:text-zinc-text border-l border-white/5"><ChevronRight className="w-4 h-4" /></button>
           </div>
           
           {/* Filters */}
           <AmberDropdown 
              options={TECHNICIANS}
              value={selectedTech}
              onChange={setSelectedTech}
              className="w-40"
           />
           
           <div className="flex bg-obsidian-panel border border-white/10 rounded-sm p-0.5">
              {['Month', 'Week'].map(mode => (
                 <button 
                   key={mode}
                   onClick={() => setViewMode(mode as any)}
                   className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                      viewMode === mode ? "bg-brand/10 text-brand" : "text-zinc-muted hover:text-zinc-text"
                   )}
                 >
                    {mode}
                 </button>
              ))}
           </div>
           
           <AmberButton size="sm" onClick={() => navigate(paths.newRepair)}>
              <Plus className="w-3.5 h-3.5 mr-2" /> New Job
           </AmberButton>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
         
         {/* Calendar Grid */}
         <div className="lg:col-span-3 flex flex-col h-full bg-obsidian-panel border border-white/5 rounded-lg overflow-hidden shadow-xl">
            {/* Days Header */}
            <div className="grid grid-cols-7 bg-obsidian-outer border-b border-white/5">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">
                     {day}
                  </div>
               ))}
            </div>
            
            {/* Grid Body */}
            <div className="flex-1 grid grid-cols-7 bg-obsidian-outer auto-rows-fr overflow-y-auto">
               {renderCalendarGrid()}
            </div>
            
            {/* Legend */}
            <div className="p-3 bg-obsidian-outer border-t border-white/5 flex gap-6 justify-center">
               {[
                 { label: 'Open', color: 'bg-brand' },
                 { label: 'In Progress', color: 'bg-warning' },
                 { label: 'Waiting Parts', color: 'bg-danger' },
                 { label: 'Completed', color: 'bg-success' }
               ].map(l => (
                 <div key={l.label} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", l.color)} />
                    <span className="text-[9px] font-bold text-zinc-muted uppercase tracking-wide">{l.label}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Sidebar: Day Detail */}
         <div className="lg:col-span-1 flex flex-col h-full gap-6">
            <AmberCard className="flex-1 flex flex-col overflow-hidden bg-obsidian-panel/60 border-white/10" glass>
               <div className="p-5 border-b border-white/5 bg-obsidian-panel/80">
                  <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                     <Clock className="w-4 h-4 text-brand" /> 
                     {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}
                  </h3>
                  <p className="text-[9px] font-bold text-zinc-muted mt-1 uppercase tracking-wide">
                     {selectedDayEvents.length} Scheduled Jobs
                  </p>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedDayEvents.length > 0 ? (
                     selectedDayEvents.map(ev => (
                        <div 
                           key={ev.id} 
                           className="p-3 bg-obsidian-outer border border-white/5 rounded-sm hover:border-brand/20 transition-all group cursor-pointer"
                           onClick={() => navigate(`/repairs/${ev.id}`)}
                        >
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-zinc-text uppercase bg-white/5 px-1.5 py-0.5 rounded">{ev.time}</span>
                              <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm border", getStatusColor(ev.status))}>{ev.status}</span>
                           </div>
                           <h4 className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors">{ev.device}</h4>
                           <p className="text-[10px] text-zinc-muted">{ev.customer}</p>
                           
                           <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2">
                              <User className="w-3 h-3 text-zinc-muted" />
                              <span className="text-[9px] font-medium text-zinc-secondary">{ev.technician}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="flex flex-col items-center justify-center h-40 text-zinc-muted opacity-40">
                        <Wrench className="w-8 h-8 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No repairs scheduled</p>
                     </div>
                  )}
               </div>

               <div className="p-4 border-t border-white/5">
                  <AmberButton size="sm" variant="secondary" className="w-full justify-center" onClick={() => navigate(paths.newRepair)}>
                     <Plus className="w-3.5 h-3.5 mr-2" /> Add to Schedule
                  </AmberButton>
               </div>
            </AmberCard>
            
            {/* Mini Month Stats */}
            <AmberCard className="p-5">
               <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-3">Month Performance</h4>
               <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                     <span className="text-zinc-secondary">Completed</span>
                     <span className="font-bold text-success">42</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-zinc-secondary">Pending</span>
                     <span className="font-bold text-warning">18</span>
                  </div>
                  <div className="w-full h-1.5 bg-obsidian-outer rounded-full overflow-hidden mt-1">
                     <div className="h-full bg-success w-[70%]" />
                  </div>
               </div>
            </AmberCard>
         </div>
      </div>
    </div>
  );
};
