
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  MoreVertical,
  Calendar,
  AlertCircle,
  CreditCard,
  Trash2,
  Edit,
  Clock
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
interface ScheduledPayment {
  id: string;
  debtorId: string;
  debtorName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Overdue' | 'Paid';
  recurring: 'None' | 'Weekly' | 'Monthly';
}

const INITIAL_PAYMENTS: ScheduledPayment[] = [
  { id: 'SP-101', debtorId: 'DEB-1001', debtorName: 'TechNova Solutions', amount: 2500, dueDate: '2025-05-20', status: 'Pending', recurring: 'Monthly' },
  { id: 'SP-102', debtorId: 'DEB-1002', debtorName: 'BlueSky Logistics', amount: 1500, dueDate: '2025-05-22', status: 'Pending', recurring: 'None' },
  { id: 'SP-103', debtorId: 'DEB-1003', debtorName: 'Rapid Ventures', amount: 800, dueDate: '2025-05-25', status: 'Pending', recurring: 'Weekly' },
  { id: 'SP-104', debtorId: 'DEB-1004', debtorName: 'Omega Corp', amount: 5000, dueDate: '2025-05-15', status: 'Overdue', recurring: 'None' },
  { id: 'SP-105', debtorId: 'DEB-1001', debtorName: 'TechNova Solutions', amount: 2500, dueDate: '2025-06-20', status: 'Pending', recurring: 'Monthly' },
];

const DEBTORS = [
  { label: 'TechNova Solutions', value: 'DEB-1001' },
  { label: 'BlueSky Logistics', value: 'DEB-1002' },
  { label: 'Rapid Ventures', value: 'DEB-1003' },
  { label: 'Omega Corp', value: 'DEB-1004' },
];

export const PaymentSchedule = () => {
  const navigate = useNavigate();
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [payments, setPayments] = useState<ScheduledPayment[]>(INITIAL_PAYMENTS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ScheduledPayment>>({
    debtorId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    recurring: 'None',
    status: 'Pending'
  });

  // --- Calendar Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Use local date formatting to avoid timezone shifts
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${d}`);
  };

  const handleSave = () => {
    if (!formData.debtorId || !formData.amount || !formData.dueDate) return;

    const debtor = DEBTORS.find(d => d.value === formData.debtorId);
    
    const newPayment: ScheduledPayment = {
      id: `SP-${Math.floor(Date.now() / 1000)}`,
      debtorId: formData.debtorId,
      debtorName: debtor?.label || 'Unknown',
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      status: 'Pending',
      recurring: (formData.recurring as any) || 'None'
    };

    setPayments([...payments, newPayment]);
    setIsAddOpen(false);
    setFormData({ debtorId: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], recurring: 'None' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this scheduled payment?')) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const handleMarkPaid = (payment: ScheduledPayment) => {
    // In a real app, this would navigate to record payment with pre-filled data
    navigate(paths.recordPayment, { state: { paymentId: payment.id, amount: payment.amount, debtorId: payment.debtorId } });
  };

  // --- Render Calendar Grid ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for start offset
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-obsidian-outer/30 border border-white/[0.02]" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPayments = payments.filter(p => p.dueDate === dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-24 border border-white/[0.05] p-2 relative cursor-pointer hover:bg-white/5 transition-colors group",
            isSelected ? "bg-brand/5 border-brand/20" : "bg-obsidian-panel",
            isToday && "bg-white/[0.02]"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
              isToday ? "bg-brand text-obsidian-outer" : "text-zinc-muted group-hover:text-zinc-text"
            )}>
              {day}
            </span>
            {dayPayments.length > 0 && (
               <span className="text-[9px] font-black text-zinc-muted bg-white/5 px-1.5 rounded">{dayPayments.length}</span>
            )}
          </div>
          
          <div className="mt-2 space-y-1">
             {dayPayments.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center gap-1 text-[9px] truncate">
                   <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
                      p.status === 'Paid' ? "bg-success" : 
                      p.status === 'Overdue' ? "bg-danger" : "bg-warning"
                   )} />
                   <span className={cn(
                      "truncate font-medium", 
                      p.status === 'Paid' ? "text-zinc-muted line-through" : "text-zinc-secondary"
                   )}>
                      ${p.amount.toLocaleString()}
                   </span>
                </div>
             ))}
             {dayPayments.length > 3 && (
                <div className="text-[8px] text-zinc-muted pl-2.5">+ {dayPayments.length - 3} more</div>
             )}
          </div>
        </div>
      );
    }

    return days;
  };

  const filteredList = useMemo(() => {
     if (selectedDate) {
        return payments.filter(p => p.dueDate === selectedDate);
     }
     // If no date selected, show all future payments sorted by date
     return [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments, selectedDate]);

  return (
    <div className="animate-fade-up space-y-6 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <CalendarClock className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Payment Schedule</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage expected receivables</p>
        </div>
        <AmberButton size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-2" /> Add Schedule
        </AmberButton>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
         
         {/* Left: Calendar */}
         <AmberCard className="lg:col-span-2 flex flex-col p-0 overflow-hidden bg-obsidian-outer/20">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 bg-obsidian-panel border-b border-white/5">
               <h2 className="text-lg font-black text-zinc-text uppercase tracking-tight">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
               </h2>
               <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="p-2 bg-obsidian-outer hover:bg-white/5 rounded-sm border border-white/5 text-zinc-muted hover:text-zinc-text transition-colors">
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-obsidian-outer hover:bg-white/5 rounded-sm border border-white/5 text-[10px] font-bold text-zinc-text uppercase tracking-widest transition-colors">
                     Today
                  </button>
                  <button onClick={handleNextMonth} className="p-2 bg-obsidian-outer hover:bg-white/5 rounded-sm border border-white/5 text-zinc-muted hover:text-zinc-text transition-colors">
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 bg-obsidian-panel border-b border-white/5">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                     {day}
                  </div>
               ))}
            </div>

            {/* Grid Body */}
            <div className="flex-1 grid grid-cols-7 bg-obsidian-outer overflow-y-auto">
               {renderCalendar()}
            </div>
         </AmberCard>

         {/* Right: List */}
         <AmberCard className="lg:col-span-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-obsidian-panel flex justify-between items-center">
               <div>
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">
                     {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'}) : 'All Upcoming'}
                  </h3>
                  <p className="text-[9px] text-zinc-muted font-bold uppercase mt-0.5">{filteredList.length} Payments Due</p>
               </div>
               {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-[9px] text-brand hover:underline uppercase tracking-widest">View All</button>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-obsidian-outer/20">
               {filteredList.length > 0 ? (
                  filteredList.map(item => (
                     <div key={item.id} className="p-3 bg-obsidian-panel border border-white/5 rounded-sm group hover:border-brand/20 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">{item.dueDate}</span>
                           <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest",
                              item.status === 'Paid' ? "bg-success/10 text-success border-success/20" :
                              item.status === 'Overdue' ? "bg-danger/10 text-danger border-danger/20" :
                              "bg-warning/10 text-warning border-warning/20"
                           )}>
                              {item.status}
                           </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-text mb-0.5">{item.debtorName}</h4>
                        <div className="flex justify-between items-end">
                           <div className="flex items-center gap-2 text-[10px] text-zinc-secondary">
                              {item.recurring !== 'None' && (
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.recurring}</span>
                              )}
                           </div>
                           <span className="text-lg font-black text-zinc-text">${item.amount.toLocaleString()}</span>
                        </div>
                        
                        {/* Action Hover */}
                        <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <button 
                              onClick={() => handleMarkPaid(item)}
                              className="flex-1 py-1.5 bg-success/10 text-success border border-success/20 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-success/20 transition-colors flex items-center justify-center gap-1"
                           >
                              <CheckCircle2 className="w-3 h-3" /> Paid
                           </button>
                           <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white/5 text-zinc-muted hover:text-danger rounded-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-muted opacity-50">
                     <Calendar className="w-8 h-8 mb-2 stroke-1" />
                     <p className="text-[10px] uppercase tracking-widest">No payments scheduled</p>
                  </div>
               )}
            </div>
         </AmberCard>
      </div>

      {/* Add Modal */}
      <AmberSlideOver
         isOpen={isAddOpen}
         onClose={() => setIsAddOpen(false)}
         title="Schedule Payment"
         description="Add a new expected receivable to the calendar."
         footer={
            <>
               <AmberButton variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</AmberButton>
               <AmberButton onClick={handleSave}>Add to Schedule</AmberButton>
            </>
         }
      >
         <div className="space-y-6">
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Debtor</label>
               <AmberAutocomplete 
                  options={DEBTORS}
                  value={formData.debtorId}
                  onChange={(val) => setFormData({...formData, debtorId: val})}
                  placeholder="Select Debtor..."
               />
            </div>

            <AmberInput 
               label="Amount ($)"
               type="number"
               value={formData.amount}
               onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />

            <div className="grid grid-cols-2 gap-4">
               <AmberInput 
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
               />
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Recurring</label>
                  <AmberDropdown 
                     options={['None', 'Weekly', 'Monthly'].map(v => ({label: v, value: v}))}
                     value={formData.recurring as string}
                     onChange={(val) => setFormData({...formData, recurring: val as any})}
                     className="w-full"
                  />
               </div>
            </div>

            <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-start gap-3">
               <AlertCircle className="w-4 h-4 text-info mt-0.5" />
               <div>
                  <p className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Automated Reminders</p>
                  <p className="text-[9px] text-zinc-muted mt-1 leading-relaxed">System will automatically send an email reminder 3 days before the due date if status remains 'Pending'.</p>
               </div>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
