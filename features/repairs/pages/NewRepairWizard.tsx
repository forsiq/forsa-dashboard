
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberAutocomplete } from '../../../amber-ui/components/AmberAutocomplete';
import { 
  User, 
  Smartphone, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  UploadCloud, 
  X, 
  Plus, 
  Camera,
  Search,
  FileText
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Types ---
interface RepairData {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    altPhone: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    serial: string;
    password: string;
    condition: string;
    accessories: string[];
    photos: string[]; // Placeholder for file names/urls
  };
  issue: {
    category: string;
    title: string;
    description: string;
    troubleshooting: string[];
    notes: string;
  };
  meta: {
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    estimate: string; // Date
    technician: string;
  };
}

// --- Mock Data ---
const CUSTOMERS = [
  { label: 'Alex Morgan', value: 'cust_1', phone: '+1 555-0199', email: 'alex@example.com' },
  { label: 'Sarah Chen', value: 'cust_2', phone: '+1 555-3321', email: 'sarah@example.com' },
  { label: 'James Wilson', value: 'cust_3', phone: '+44 20 7123', email: 'james@example.com' },
];

const DEVICE_TYPES = [
  { label: 'Smartphone', value: 'Smartphone' },
  { label: 'Tablet', value: 'Tablet' },
  { label: 'Laptop', value: 'Laptop' },
  { label: 'Desktop', value: 'Desktop' },
  { label: 'Console', value: 'Console' },
  { label: 'Wearable', value: 'Wearable' },
];

const BRANDS = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Google', value: 'Google' },
  { label: 'Dell', value: 'Dell' },
  { label: 'HP', value: 'HP' },
  { label: 'Sony', value: 'Sony' },
];

const CONDITIONS = [
  { label: 'Excellent (Like New)', value: 'Excellent' },
  { label: 'Good (Minor Scratches)', value: 'Good' },
  { label: 'Fair (Visible Wear)', value: 'Fair' },
  { label: 'Poor (Heavy Damage)', value: 'Poor' },
  { label: 'Non-Functional', value: 'Damaged' },
];

const ISSUE_CATEGORIES = [
  { label: 'Screen/Display', value: 'Screen' },
  { label: 'Battery/Power', value: 'Battery' },
  { label: 'Water Damage', value: 'Water Damage' },
  { label: 'Software/OS', value: 'Software' },
  { label: 'Keyboard/Input', value: 'Input' },
  { label: 'Logic Board', value: 'Logic Board' },
  { label: 'Other', value: 'Other' },
];

const TECHNICIANS = [
  { label: 'Unassigned', value: 'Unassigned' },
  { label: 'Mike Ross', value: 't1' },
  { label: 'Elena Fisher', value: 't2' },
];

const ACCESSORY_OPTIONS = ['Charger', 'Case', 'Original Box', 'SIM Tray', 'Cable'];
const TROUBLESHOOTING_OPTIONS = ['Restarted Device', 'Factory Reset', 'Safe Mode', 'Updated OS'];

// --- Steps ---
const STEPS = [
  { id: 1, title: 'Customer', icon: User },
  { id: 2, title: 'Device', icon: Smartphone },
  { id: 3, title: 'Issue', icon: Wrench },
  { id: 4, title: 'Review', icon: CheckCircle2 },
];

export const NewRepairWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RepairData>({
    customer: { id: '', name: '', phone: '', email: '', altPhone: '' },
    device: { type: 'Smartphone', brand: '', model: '', serial: '', password: '', condition: 'Good', accessories: [], photos: [] },
    issue: { category: 'Screen', title: '', description: '', troubleshooting: [], notes: '' },
    meta: { priority: 'Medium', estimate: '', technician: 'Unassigned' }
  });

  const [customerSearch, setCustomerSearch] = useState('');

  // --- Handlers ---
  const updateCustomer = (field: string, value: string) => {
    setData(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  };

  const selectCustomer = (id: string) => {
    const found = CUSTOMERS.find(c => c.value === id);
    if (found) {
      setData(prev => ({
        ...prev,
        customer: { ...prev.customer, id, name: found.label, phone: found.phone, email: found.email }
      }));
    }
  };

  const updateDevice = (field: string, value: any) => {
    setData(prev => ({ ...prev, device: { ...prev.device, [field]: value } }));
  };

  const toggleAccessory = (acc: string) => {
    setData(prev => {
      const current = prev.device.accessories;
      const updated = current.includes(acc) ? current.filter(a => a !== acc) : [...current, acc];
      return { ...prev, device: { ...prev.device, accessories: updated } };
    });
  };

  const updateIssue = (field: string, value: any) => {
    setData(prev => ({ ...prev, issue: { ...prev.issue, [field]: value } }));
  };

  const toggleTroubleshooting = (ts: string) => {
    setData(prev => {
      const current = prev.issue.troubleshooting;
      const updated = current.includes(ts) ? current.filter(t => t !== ts) : [...current, ts];
      return { ...prev, issue: { ...prev.issue, troubleshooting: updated } };
    });
  };

  const updateMeta = (field: string, value: any) => {
    setData(prev => ({ ...prev, meta: { ...prev.meta, [field]: value } }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = () => {
    // Simulate API call
    console.log("Submitting Repair:", data);
    navigate(paths.repairDashboard);
  };

  // --- Render Steps ---
  
  const renderCustomerStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AmberCard className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
            <Search className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Find Existing</h3>
          </div>
          <div className="space-y-4">
             <AmberAutocomplete 
                label="Search Customer"
                options={CUSTOMERS}
                value={data.customer.id}
                onChange={selectCustomer}
                placeholder="Name, Phone, Email..."
             />
             <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm text-center">
                <p className="text-[10px] text-zinc-muted">Or enter details manually below for new customer</p>
             </div>
          </div>
        </AmberCard>
        
        <AmberCard className="p-6 space-y-5">
           <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-2">
             <User className="w-4 h-4 text-info" />
             <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Contact Details</h3>
           </div>
           <AmberInput 
              label="Full Name"
              value={data.customer.name}
              onChange={(e) => updateCustomer('name', e.target.value)}
              placeholder="e.g. Jane Doe"
           />
           <div className="grid grid-cols-2 gap-4">
              <AmberInput 
                 label="Phone Number"
                 value={data.customer.phone}
                 onChange={(e) => updateCustomer('phone', e.target.value)}
                 placeholder="+1..."
              />
              <AmberInput 
                 label="Alt Phone"
                 value={data.customer.altPhone}
                 onChange={(e) => updateCustomer('altPhone', e.target.value)}
                 placeholder="Optional"
              />
           </div>
           <AmberInput 
              label="Email Address"
              type="email"
              value={data.customer.email}
              onChange={(e) => updateCustomer('email', e.target.value)}
              placeholder="jane@example.com"
           />
        </AmberCard>
      </div>
    </div>
  );

  const renderDeviceStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <AmberCard className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Device Type</label>
                    <AmberDropdown 
                       options={DEVICE_TYPES}
                       value={data.device.type}
                       onChange={(val) => updateDevice('type', val)}
                       className="w-full"
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Brand</label>
                    <AmberDropdown 
                       options={BRANDS}
                       value={data.device.brand}
                       onChange={(val) => updateDevice('brand', val)}
                       className="w-full"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <AmberInput 
                    label="Model Name/Number"
                    value={data.device.model}
                    onChange={(e) => updateDevice('model', e.target.value)}
                    placeholder="e.g. iPhone 14 Pro"
                 />
                 <AmberInput 
                    label="Serial / IMEI"
                    value={data.device.serial}
                    onChange={(e) => updateDevice('serial', e.target.value)}
                    placeholder="Optional"
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <AmberInput 
                    label="Passcode / Pattern"
                    value={data.device.password}
                    onChange={(e) => updateDevice('password', e.target.value)}
                    placeholder="Leave blank if removed"
                 />
                 <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Condition</label>
                    <AmberDropdown 
                       options={CONDITIONS}
                       value={data.device.condition}
                       onChange={(val) => updateDevice('condition', val)}
                       className="w-full"
                    />
                 </div>
              </div>
           </AmberCard>
           
           <AmberCard className="p-6">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-3 block">Accessories Received</label>
              <div className="flex flex-wrap gap-3">
                 {ACCESSORY_OPTIONS.map(acc => (
                    <button
                       key={acc}
                       onClick={() => toggleAccessory(acc)}
                       className={cn(
                          "px-3 py-1.5 rounded-sm border text-[10px] font-bold uppercase tracking-wide transition-all",
                          data.device.accessories.includes(acc) 
                             ? "bg-brand/10 border-brand text-brand" 
                             : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                       )}
                    >
                       {acc}
                    </button>
                 ))}
              </div>
           </AmberCard>
        </div>
        
        <div className="space-y-6">
           <AmberCard className="p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10 bg-obsidian-outer/20 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-zinc-muted">
                 <Camera className="w-8 h-8" />
              </div>
              <div>
                 <h4 className="text-xs font-bold text-zinc-text uppercase tracking-widest">Device Photos</h4>
                 <p className="text-[9px] text-zinc-muted mt-1">Upload condition photos (Before repair)</p>
              </div>
              <AmberButton variant="secondary" size="sm">
                 <UploadCloud className="w-3.5 h-3.5 mr-2" /> Upload Files
              </AmberButton>
              <p className="text-[8px] text-zinc-muted italic">Max 5MB per image</p>
           </AmberCard>
        </div>
      </div>
    </div>
  );

  const renderIssueStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
       <AmberCard className="p-6 space-y-6">
          <div>
             <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Primary Issue Category</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ISSUE_CATEGORIES.map(cat => (
                   <button
                      key={cat.value}
                      onClick={() => updateIssue('category', cat.value)}
                      className={cn(
                         "p-3 rounded-sm border text-center transition-all",
                         data.issue.category === cat.value 
                            ? "bg-brand/10 border-brand text-brand" 
                            : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                      )}
                   >
                      <p className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</p>
                   </button>
                ))}
             </div>
          </div>
          
          <AmberInput 
             label="Issue Title"
             value={data.issue.title}
             onChange={(e) => updateIssue('title', e.target.value)}
             placeholder="e.g. Cracked Screen, top left corner"
          />
          
          <AmberInput 
             label="Detailed Description"
             multiline
             rows={5}
             value={data.issue.description}
             onChange={(e) => updateIssue('description', e.target.value)}
             placeholder="Customer reported symptoms, recreation steps..."
          />

          <div>
             <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Pre-Troubleshooting</label>
             <div className="flex flex-wrap gap-3">
                 {TROUBLESHOOTING_OPTIONS.map(ts => (
                    <button
                       key={ts}
                       onClick={() => toggleTroubleshooting(ts)}
                       className={cn(
                          "px-3 py-1.5 rounded-sm border text-[10px] font-bold uppercase tracking-wide transition-all",
                          data.issue.troubleshooting.includes(ts)
                             ? "bg-info/10 border-info text-info" 
                             : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                       )}
                    >
                       {ts}
                    </button>
                 ))}
             </div>
          </div>

          <AmberInput 
             label="Internal Notes"
             multiline
             rows={2}
             value={data.issue.notes}
             onChange={(e) => updateIssue('notes', e.target.value)}
             placeholder="Staff only notes..."
          />
       </AmberCard>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <AmberCard className="p-6 bg-obsidian-panel/60 border-brand/20">
                <div className="flex items-center gap-2 mb-6 text-brand">
                   <FileText className="w-5 h-5" />
                   <h3 className="text-sm font-black uppercase tracking-widest">Summary</h3>
                </div>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                         <p className="text-zinc-muted font-bold uppercase text-[10px] mb-1">Customer</p>
                         <p className="text-zinc-text">{data.customer.name}</p>
                         <p className="text-zinc-secondary">{data.customer.phone}</p>
                      </div>
                      <div>
                         <p className="text-zinc-muted font-bold uppercase text-[10px] mb-1">Device</p>
                         <p className="text-zinc-text">{data.device.brand} {data.device.model}</p>
                         <p className="text-zinc-secondary">{data.device.type}</p>
                      </div>
                   </div>
                   <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                      <p className="text-zinc-muted font-bold uppercase text-[10px] mb-2">Issue: {data.issue.category}</p>
                      <p className="text-sm font-bold text-zinc-text mb-1">{data.issue.title}</p>
                      <p className="text-xs text-zinc-secondary leading-relaxed">{data.issue.description}</p>
                   </div>
                </div>
             </AmberCard>

             <AmberCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                   <CheckCircle2 className="w-4 h-4 text-success" />
                   <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Final Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Priority</label>
                      <AmberDropdown 
                         options={['Low', 'Medium', 'High', 'Critical'].map(p => ({label: p, value: p}))}
                         value={data.meta.priority}
                         onChange={(val) => updateMeta('priority', val)}
                         className="w-full"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Assign Tech</label>
                      <AmberDropdown 
                         options={TECHNICIANS}
                         value={data.meta.technician}
                         onChange={(val) => updateMeta('technician', val)}
                         className="w-full"
                      />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Estimate Date</label>
                      <input 
                         type="date" 
                         value={data.meta.estimate} 
                         onChange={(e) => updateMeta('estimate', e.target.value)}
                         className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
                      />
                   </div>
                </div>
             </AmberCard>
          </div>
          
          <div className="space-y-4">
             <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm text-[10px] text-zinc-muted italic leading-relaxed">
                By submitting this ticket, you confirm that the device details and initial assessment are accurate. The customer will receive an automated confirmation via email/SMS if configured.
             </div>
             <AmberButton className="w-full justify-center h-12 text-sm" onClick={handleSubmit}>
                Submit Repair Ticket <ArrowRight className="w-4 h-4 ml-2" />
             </AmberButton>
             <AmberButton variant="ghost" className="w-full justify-center" onClick={() => navigate(paths.repairDashboard)}>
                Save as Draft
             </AmberButton>
          </div>
       </div>
    </div>
  );

  return (
    <div className="animate-fade-up max-w-[1200px] mx-auto py-6 space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(paths.repairDashboard)} className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">New Repair Ticket</h1>
               <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Service Intake Wizard</p>
            </div>
         </div>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-3xl mx-auto px-4">
         <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2 rounded-full" />
            <div 
               className="absolute top-1/2 left-0 h-0.5 bg-brand -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
               style={{ width: `${((currentStep - 1) / 3) * 100}%` }} 
            />
            {STEPS.map((step) => {
               const isActive = currentStep === step.id;
               const isCompleted = currentStep > step.id;
               return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-obsidian-outer px-2">
                     <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isActive ? "border-brand text-brand scale-110 bg-obsidian-panel shadow-lg shadow-brand/10" :
                        isCompleted ? "border-brand bg-brand text-obsidian-outer" :
                        "border-white/10 text-zinc-muted bg-obsidian-panel"
                     )}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                     </div>
                     <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isActive ? "text-brand" : isCompleted ? "text-zinc-text" : "text-zinc-muted"
                     )}>{step.title}</span>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
         {currentStep === 1 && renderCustomerStep()}
         {currentStep === 2 && renderDeviceStep()}
         {currentStep === 3 && renderIssueStep()}
         {currentStep === 4 && renderReviewStep()}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-6 border-t border-white/5">
         <AmberButton 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className={currentStep === 1 ? "invisible" : ""}
         >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Previous
         </AmberButton>
         
         {currentStep < 4 && (
            <AmberButton onClick={nextStep}>
               Next Step <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </AmberButton>
         )}
      </div>
    </div>
  );
};
