
import React from 'react';
import { AmberCard } from '../../amber-ui/components/AmberCard';
import { AmberButton } from '../../amber-ui/components/AmberButton';
import { DataTable, Column } from '../../amber-ui/components/Data/DataTable';
import { StatusBadge, StatusVariant } from '../../amber-ui/components/Data/StatusBadge';
import { 
  Server, 
  Settings, 
  Trash2, 
  Activity, 
  Database, 
  Cpu, 
  Globe 
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface SystemNode {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Warning' | 'Error';
  role: string;
  budget: number;
  lastActive: string;
}

const MOCK_DATA: SystemNode[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `NODE-${1000 + i}`,
  name: `Cluster-Node-${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  type: i % 3 === 0 ? 'Compute' : i % 3 === 1 ? 'Storage' : 'Network',
  status: ['Active', 'Active', 'Inactive', 'Warning', 'Error'][i % 5] as any,
  role: i % 2 === 0 ? 'Primary' : 'Replica',
  budget: Math.floor(Math.random() * 5000) + 1000,
  lastActive: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0]
}));

export const TableExample = () => {
  const handleEdit = (row: SystemNode) => {
    alert(`Configure Node: ${row.name}`);
  };

  const handleDelete = (row: SystemNode) => {
    if (confirm(`Delete node ${row.id}?`)) {
      alert(`Deleted ${row.id}`);
    }
  };

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'inactive';
      case 'Warning': return 'warning';
      case 'Error': return 'error';
      default: return 'info';
    }
  };

  const columns: Column<SystemNode>[] = [
    {
      key: 'id',
      label: 'Node ID',
      render: (row) => <span className="font-mono font-bold text-zinc-muted">{row.id}</span>,
      sortable: true,
      width: 'w-32'
    },
    {
      key: 'name',
      label: 'Node Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted">
            {row.type === 'Compute' ? <Cpu className="w-4 h-4" /> : 
             row.type === 'Storage' ? <Database className="w-4 h-4" /> : 
             <Globe className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-bold text-zinc-text">{row.name}</p>
            <p className="text-[9px] text-zinc-muted uppercase tracking-wide">{row.type}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} variant={getStatusVariant(row.status)} showDot size="sm" />
      ),
      sortable: true,
      width: 'w-32'
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border",
          row.role === 'Primary' ? "bg-brand/10 border-brand/20 text-brand" : "bg-white/5 border-white/10 text-zinc-muted"
        )}>
          {row.role}
        </span>
      ),
      sortable: true,
      align: 'center'
    },
    {
      key: 'budget',
      label: 'Allocated Budget',
      render: (row) => <span className="font-mono text-zinc-text">${row.budget.toLocaleString()}</span>,
      sortable: true,
      align: 'right'
    },
    {
      key: 'lastActive',
      label: 'Last Signal',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 text-zinc-muted">
          <Activity className="w-3 h-3" />
          <span>{row.lastActive}</span>
        </div>
      ),
      sortable: true,
      align: 'right'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Server className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Data Table Example</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Demonstration of the reusable data table component</p>
        </div>
        <AmberButton size="sm">
          Export Data
        </AmberButton>
      </div>

      <AmberCard noPadding className="border-white/10">
        <DataTable
          columns={columns}
          data={MOCK_DATA}
          sortable
          selectable
          pagination
          pageSize={8}
          onSelectionChange={(ids) => console.log('Selected:', ids)}
          rowActions={[
            {
              label: 'Configure',
              icon: Settings,
              onClick: handleEdit
            },
            {
              label: 'Delete Node',
              icon: Trash2,
              onClick: handleDelete,
              variant: 'danger'
            }
          ]}
          emptyMessage="No system nodes found."
        />
      </AmberCard>
    </div>
  );
};
