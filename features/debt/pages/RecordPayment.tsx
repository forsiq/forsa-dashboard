
import React, { useState, useEffect } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Mail, 
  MessageSquare,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
const DEBTORS = [
  { label: 'TechNova Solutions (ID: DEB-1001)', value: 'DEB-1001', name: 'TechNova Solutions', balance: 12500, email: 'finance@technova.com', phone: '+1 555-0199' },
  { label: 'BlueSky Logistics (ID: DEB-1002)', value: 'DEB-1002', name: 'BlueSky Logistics', balance: 8400, email: 'ap@bluesky.io', phone: '+1 555-3321' },
  { label: 'Rapid Ventures (ID: DEB-1003)', value: 'DEB-1003', name: 'Rapid Ventures', balance: 3200, email: 'accounting@rapid.co', phone: '+44 20 7123' },
  { label: 'Omega Corp (ID: DEB-1004)', value: 'DEB-1004', name: 'Omega Corp', balance: 40000, email: 'billing@omega.net', phone: '+1 555-9988' },
];

export const RecordPayment = () => {
  const navigate = useNavigate();
  
  // State
  const [selectedDebtorId, setSelectedDebtorId] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    reference: '',
    notes: ''
  });
  const [options, setOptions] = useState({
    email: true,
    sms: false,
    print: true
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Derived
  const currentDebtor = DEBTORS.find(d => d.value === selectedDebtorId);
  const numericAmount = parseFloat(formData.amount) || 0;
  const remainingBalance = currentDebtor ? currentDebtor.balance - numericAmount : 0;
  const isOverBalance = currentDebtor && numericAmount > currentDebtor.balance;

  // Handlers
  const handleSubmit = (scheduleNext: boolean) => {
    if (!currentDebtor || !numericAmount || isOverBalance) return;
    
    // Simulate API call
    setIsSuccess(true);
    
    // In a real app, handle scheduling redirection
    if (scheduleNext) {
        setTimeout(() => alert("Redirecting to schedule..."), 1000);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedDebtorId('');
    setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        reference: '',
        notes: ''
    });
  };

  if (isSuccess) {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-success mb-6">
                  <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter mb-2">Payment Recorded</h2>
              <p className="text-sm font-medium text-zinc-muted mb-8">Transaction has been successfully logged.</p>
              <div className="flex gap-4">
                  <AmberButton variant="secondary" onClick={() => navigate(paths.debtors)}>View Debtor</AmberButton>
                  <AmberButton onClick={handleReset}>Record Another</AmberButton>
              </div>
          </div>
      );
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Record Payment</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Process inbound transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Form */}
        <div className="space-y-6">
           <AmberCard className="p-6 space-y-6">
              <div className="space-y-4">
                  <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Select Debtor</label>
                      <AmberAutocomplete 
                          options={DEBTORS}
                          value={selectedDebtorId}
                          onChange={setSelectedDebtorId}
                          placeholder="Search by name or ID..."
                      />
                  </div>

                  {currentDebtor && (
                      <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                          <div>
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Current Balance</p>
                              <p className="text-2xl font-black text-danger">${currentDebtor.balance.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-bold text-zinc-text">{currentDebtor.name}</p>
                              <p className="text-[10px] text-zinc-muted">{currentDebtor.email}</p>
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Amount ($)</label>
                          <input 
                              type="number" 
                              className={cn(
                                  "w-full h-10 bg-obsidian-outer border rounded-sm px-3 text-sm font-bold text-zinc-text outline-none focus:border-brand/30 transition-all",
                                  isOverBalance ? "border-danger text-danger focus:border-danger" : "border-white/5"
                              )}
                              value={formData.amount}
                              onChange={(e) => setFormData({...formData, amount: e.target.value})}
                              placeholder="0.00"
                          />
                          {isOverBalance && <span className="text-[9px] text-danger font-bold mt-1 block">Exceeds balance</span>}
                      </div>
                      <AmberInput 
                          label="Payment Date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Method</label>
                        <AmberDropdown 
                            options={['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Other'].map(v => ({label: v, value: v}))}
                            value={formData.method}
                            onChange={(val) => setFormData({...formData, method: val})}
                            className="w-full"
                        />
                      </div>
                      <AmberInput 
                          label="Reference / Check No."
                          placeholder="e.g. TRX-8821"
                          value={formData.reference}
                          onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      />
                  </div>

                  <AmberInput 
                      label="Notes"
                      multiline
                      rows={3}
                      placeholder="Additional details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
              </div>
           </AmberCard>

           {/* Confirmation Options */}
           <AmberCard className="p-5 space-y-3">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-2">Confirmation & Receipt</h3>
               <div className="flex flex-col gap-2">
                   <label className="flex items-center gap-3 p-3 border border-white/5 rounded-sm cursor-pointer hover:bg-white/5 transition-colors">
                       <input type="checkbox" checked={options.email} onChange={(e) => setOptions({...options, email: e.target.checked})} className="accent-brand" />
                       <Mail className="w-4 h-4 text-zinc-muted" />
                       <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Email Receipt to Customer</span>
                   </label>
                   <label className="flex items-center gap-3 p-3 border border-white/5 rounded-sm cursor-pointer hover:bg-white/5 transition-colors">
                       <input type="checkbox" checked={options.sms} onChange={(e) => setOptions({...options, sms: e.target.checked})} className="accent-brand" />
                       <MessageSquare className="w-4 h-4 text-zinc-muted" />
                       <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Send SMS Notification</span>
                   </label>
                   <label className="flex items-center gap-3 p-3 border border-white/5 rounded-sm cursor-pointer hover:bg-white/5 transition-colors">
                       <input type="checkbox" checked={options.print} onChange={(e) => setOptions({...options, print: e.target.checked})} className="accent-brand" />
                       <Printer className="w-4 h-4 text-zinc-muted" />
                       <span className="text-[10px] font-bold text-zinc-text uppercase tracking-wide">Generate PDF Receipt</span>
                   </label>
               </div>
           </AmberCard>
        </div>

        {/* Right Column: Preview & Submit */}
        <div className="space-y-6">
           {/* Receipt Preview */}
           <div className="bg-white text-black p-8 rounded-sm shadow-2xl relative font-mono text-xs leading-relaxed opacity-90">
               {/* Tape Effect Top */}
               <div className="absolute -top-1 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI1IiB2aWV3Qm94PSIwIDAgMTAgNSI+PHBhdGggZD0iTTAgNWw1LTUgNSA1eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-repeat-x"></div>

               <div className="text-center mb-6">
                   <h2 className="text-lg font-black uppercase tracking-tight mb-1">Payment Receipt</h2>
                   <p className="text-[10px] uppercase tracking-widest opacity-60">ZoneVast Enterprise</p>
                   <p className="mt-2">{formData.date || 'DATE'}</p>
               </div>

               <div className="border-b-2 border-black border-dashed pb-4 mb-4 space-y-2">
                   <div className="flex justify-between">
                       <span>CUSTOMER:</span>
                       <span className="font-bold text-right max-w-[150px]">{currentDebtor?.name || '---'}</span>
                   </div>
                   <div className="flex justify-between">
                       <span>METHOD:</span>
                       <span className="font-bold">{formData.method}</span>
                   </div>
                   <div className="flex justify-between">
                       <span>REF NO:</span>
                       <span className="font-bold">{formData.reference || '---'}</span>
                   </div>
               </div>

               <div className="border-b-2 border-black border-dashed pb-4 mb-4">
                   <div className="flex justify-between text-sm font-bold">
                       <span>AMOUNT PAID</span>
                       <span>${numericAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                   </div>
               </div>

               <div className="space-y-1 text-[10px] opacity-70 mb-8">
                   <div className="flex justify-between">
                       <span>Previous Balance:</span>
                       <span>${(currentDebtor?.balance || 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between font-bold">
                       <span>Remaining Balance:</span>
                       <span>${remainingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                   </div>
               </div>

               <div className="text-center text-[8px] uppercase tracking-widest opacity-50">
                   <p>Thank you for your business</p>
                   <p>System Generated • Auth ID: {Math.floor(Math.random() * 10000)}</p>
               </div>

               {/* Tape Effect Bottom */}
               <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI1IiB2aWV3Qm94PSIwIDAgMTAgNSI+PHBhdGggZD0iTTAgMGw1IDUgNS01eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-repeat-x"></div>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-4">
              <AmberButton 
                  className="h-12 bg-white/5 hover:bg-white/10 border-white/10 text-zinc-muted hover:text-zinc-text"
                  onClick={() => handleSubmit(true)}
                  disabled={!currentDebtor || !numericAmount || isOverBalance}
              >
                  <Clock className="w-4 h-4 mr-2" /> Record & Schedule
              </AmberButton>
              <AmberButton 
                  className="h-12 text-sm"
                  onClick={() => handleSubmit(false)}
                  disabled={!currentDebtor || !numericAmount || isOverBalance}
              >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Payment
              </AmberButton>
           </div>
           
           {isOverBalance && (
             <div className="p-3 bg-danger/10 border border-danger/20 rounded-sm flex items-center gap-3 text-danger animate-pulse">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs font-bold">Error: Payment exceeds outstanding balance.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
