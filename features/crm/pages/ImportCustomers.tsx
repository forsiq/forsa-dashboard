
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  UploadCloud, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Types & Constants ---
const STEPS = [
  { id: 1, title: 'Upload File', desc: 'CSV or XLSX' },
  { id: 2, title: 'Map Columns', desc: 'Match fields' },
  { id: 3, title: 'Review & Import', desc: 'Validate data' },
];

const SYSTEM_FIELDS = [
  { label: 'Full Name', value: 'name', required: true },
  { label: 'Email Address', value: 'email', required: true },
  { label: 'Phone Number', value: 'phone', required: false },
  { label: 'Company', value: 'company', required: false },
  { label: 'Status', value: 'status', required: false },
  { label: 'Tags', value: 'tags', required: false },
];

// Mock File Columns for Step 2
const MOCK_FILE_COLUMNS = ['First Name', 'Last Name', 'Work Email', 'Phone', 'Company Name', 'Job Title'];

// Mock Preview Data for Step 3
const MOCK_PREVIEW = [
  { name: 'Alex Morgan', email: 'alex@zonevast.com', phone: '555-0123', company: 'ZoneVast', status: 'Valid' },
  { name: 'Sarah Chen', email: 'sarah@techcore.io', phone: '555-9876', company: 'TechCore', status: 'Valid' },
  { name: 'Invalid User', email: 'invalid-email', phone: '', company: '', status: 'Error: Invalid Email' },
  { name: 'Duplicate User', email: 'alex@zonevast.com', phone: '', company: '', status: 'Error: Duplicate' },
];

export const ImportCustomers = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{success: number, error: number} | null>(null);

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Mock: Auto-map basic fields
      setMappings({
        'Work Email': 'email',
        'Company Name': 'company',
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !file) return;
    
    if (currentStep === 3) {
      startImport();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const startImport = () => {
    setIsImporting(true);
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      setImportResult({ success: 142, error: 12 });
    }, 2500);
  };

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div 
        className="border-2 border-dashed border-white/10 bg-obsidian-panel/50 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand/30 hover:bg-white/[0.02] transition-all group"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".csv,.xlsx" 
          onChange={handleFileUpload} 
        />
        <div className="w-16 h-16 bg-obsidian-outer border border-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
          {file ? <FileSpreadsheet className="w-8 h-8 text-success" /> : <UploadCloud className="w-8 h-8 text-brand" />}
        </div>
        
        {file ? (
          <div>
            <h3 className="text-lg font-bold text-zinc-text">{file.name}</h3>
            <p className="text-sm text-zinc-muted mt-1">{(file.size / 1024).toFixed(2)} KB • Ready to process</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-4 text-xs font-bold text-danger hover:underline uppercase tracking-widest"
            >
              Remove File
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-zinc-text">Drop your CSV or Excel file here</h3>
            <p className="text-sm text-zinc-muted mt-2 max-w-sm mx-auto">
              Support for .csv, .xls, .xlsx. Maximum file size 10MB.
            </p>
            <div className="mt-6">
              <span className="px-4 py-2 bg-brand text-obsidian-outer rounded-sm text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/10">
                Browse Files
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button className="text-xs font-bold text-zinc-muted hover:text-brand flex items-center gap-2 uppercase tracking-widest transition-colors">
          <Download className="w-4 h-4" /> Download Sample Template
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <AmberCard noPadding className="overflow-hidden">
        <div className="p-4 bg-obsidian-outer/50 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Column Mapping</h3>
          <p className="text-[10px] text-zinc-muted">Match your file columns to system fields</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-3 w-1/3">File Column</th>
                <th className="px-6 py-3 w-1/3">System Field</th>
                <th className="px-6 py-3 w-1/3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_FILE_COLUMNS.map((col, i) => (
                <tr key={i} className="hover:bg-white/[0.01]">
                  <td className="px-6 py-4 text-xs font-bold text-zinc-text">{col}</td>
                  <td className="px-6 py-4">
                    <AmberDropdown 
                      options={[{label: 'Skip Column', value: 'skip'}, ...SYSTEM_FIELDS.map(f => ({label: f.label + (f.required ? ' *' : ''), value: f.value}))]}
                      value={mappings[col] || 'skip'}
                      onChange={(val) => setMappings({...mappings, [col]: val})}
                      className="w-full"
                      placeholder="Select Field..."
                    />
                  </td>
                  <td className="px-6 py-4">
                    {mappings[col] && mappings[col] !== 'skip' ? (
                      <span className="flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mapped
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                        <AlertCircle className="w-3.5 h-3.5" /> Skipped
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AmberCard>
      
      <div className="p-4 bg-warning/5 border border-warning/10 rounded-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-warning uppercase tracking-wide">Required Fields Check</h4>
          <p className="text-[10px] text-zinc-muted mt-1 leading-relaxed">
            Ensure that <span className="text-zinc-text font-bold">Email Address</span> is mapped. Rows without a valid email will be skipped automatically during import.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-obsidian-panel border border-white/5 rounded-sm">
          <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Total Rows</p>
          <p className="text-2xl font-black text-zinc-text">154</p>
        </div>
        <div className="p-4 bg-success/5 border border-success/10 rounded-sm">
          <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Valid Records</p>
          <p className="text-2xl font-black text-success">148</p>
        </div>
        <div className="p-4 bg-danger/5 border border-danger/10 rounded-sm">
          <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">Invalid / Duplicates</p>
          <p className="text-2xl font-black text-danger">6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Data Preview</h3>
          <AmberCard noPadding className="overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px]">
                {MOCK_PREVIEW.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01]">
                    <td className="px-4 py-2 font-bold text-zinc-text">{row.name}</td>
                    <td className="px-4 py-2 text-zinc-muted">{row.email}</td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded border uppercase tracking-widest",
                        row.status === 'Valid' ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
                      )}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AmberCard>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Settings</h3>
          <AmberCard className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Duplicate Records</label>
              <div className="space-y-2">
                {['Skip row', 'Update existing', 'Create duplicate'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 border border-white/5 bg-obsidian-outer/50 rounded-sm cursor-pointer hover:border-brand/30 transition-all">
                    <input 
                      type="radio" 
                      name="duplicate" 
                      checked={duplicateAction === opt.split(' ')[0].toLowerCase()}
                      onChange={() => setDuplicateAction(opt.split(' ')[0].toLowerCase())}
                      className="accent-brand"
                    />
                    <span className="text-xs font-medium text-zinc-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="accent-brand" />
                <span className="text-[10px] font-bold text-zinc-muted group-hover:text-zinc-text transition-colors uppercase tracking-wide">
                  Send welcome email to new contacts
                </span>
              </label>
            </div>
          </AmberCard>
        </div>
      </div>
    </div>
  );

  const renderImporting = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
        <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Importing Data...</h2>
        <p className="text-sm font-medium text-zinc-muted">Processing row 45 of 154</p>
      </div>
      <div className="w-full max-w-md bg-obsidian-panel h-1.5 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-brand w-[35%] animate-pulse" />
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in fade-in zoom-in-95">
      <div className="w-20 h-20 bg-success/10 border-2 border-success/20 rounded-full flex items-center justify-center text-success mb-2">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">Import Complete</h2>
        <p className="text-sm text-zinc-muted">Your customer database has been updated.</p>
      </div>

      <div className="flex gap-8 text-center p-6 bg-obsidian-panel border border-white/10 rounded-lg shadow-xl">
        <div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Successful</p>
          <p className="text-3xl font-black text-success">{importResult?.success}</p>
        </div>
        <div className="w-px bg-white/5" />
        <div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Errors</p>
          <p className="text-3xl font-black text-danger">{importResult?.error}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {importResult?.error ? (
          <AmberButton variant="secondary" className="border-danger/20 text-danger hover:bg-danger/10">
            <Download className="w-3.5 h-3.5 mr-2" /> Error Log
          </AmberButton>
        ) : null}
        <AmberButton onClick={() => navigate(paths.crmCustomers)}>
          Go to Customers <ArrowRight className="w-3.5 h-3.5 ml-2" />
        </AmberButton>
      </div>
    </div>
  );

  if (isImporting) return renderImporting();
  if (importResult) return renderResult();

  return (
    <div className="animate-fade-up max-w-5xl mx-auto py-8 space-y-8">
      {/* Header & Stepper */}
      <div className="flex flex-col items-center gap-8 mb-12">
        <div className="text-center">
          <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">Import Customers</h1>
          <p className="text-xs font-bold text-zinc-muted uppercase tracking-[0.3em] mt-2">Bulk Data Entry Wizard</p>
        </div>
        
        <div className="flex items-center w-full max-w-2xl relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2 rounded-full" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-brand -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
          
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all bg-obsidian-outer",
                  isActive ? "border-brand text-brand scale-110 shadow-[0_0_15px_rgba(255,192,0,0.4)]" :
                  isCompleted ? "border-brand bg-brand text-obsidian-outer" : "border-white/10 text-zinc-muted"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-black">{step.id}</span>}
                </div>
                <p className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-brand" : "text-zinc-muted")}>{step.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between pt-8 border-t border-white/5">
        {currentStep === 1 ? (
          <AmberButton variant="ghost" onClick={() => navigate(paths.crmCustomers)}>Cancel</AmberButton>
        ) : (
          <AmberButton variant="ghost" onClick={handleBack}><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</AmberButton>
        )}
        
        <AmberButton 
          onClick={handleNext} 
          disabled={currentStep === 1 && !file}
          className={currentStep === 3 ? "bg-success text-white hover:bg-success/90 border-transparent shadow-lg shadow-success/10" : ""}
        >
          {currentStep === 3 ? (
            <>Start Import <CheckCircle2 className="w-3.5 h-3.5 ml-2" /></>
          ) : (
            <>Next Step <ArrowRight className="w-3.5 h-3.5 ml-2" /></>
          )}
        </AmberButton>
      </div>
    </div>
  );
};
