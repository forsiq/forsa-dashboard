
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  ListTodo, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  User,
  Edit,
  Trash2, 
  MoreVertical,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Pending' | 'Completed';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO Date
  dueTime?: string;
  priority: Priority;
  status: Status;
  assignedTo: string;
  relatedTo?: {
    type: 'Deal' | 'Customer' | 'Lead';
    name: string;
    id: string;
  };
}

// --- Mock Data ---
const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Prepare renewal contract', dueDate: '2025-05-18', priority: 'High', status: 'Pending', assignedTo: 'Alex Morgan', relatedTo: { type: 'Customer', name: 'Acme Corp', id: 'c1' } },
  { id: 't2', title: 'Follow up on Q3 Invoice', dueDate: '2025-05-20', dueTime: '14:00', priority: 'Medium', status: 'Pending', assignedTo: 'Sarah Chen', relatedTo: { type: 'Deal', name: 'Q3 Expansion', id: 'd1' } },
  { id: 't3', title: 'Schedule demo with CTO', dueDate: '2025-05-20', priority: 'High', status: 'Pending', assignedTo: 'Alex Morgan', relatedTo: { type: 'Lead', name: 'TechStart Inc', id: 'l1' } },
  { id: 't4', title: 'Update CRM records', dueDate: '2025-05-25', priority: 'Low', status: 'Pending', assignedTo: 'James Wilson' },
  { id: 't5', title: 'Send welcome packet', dueDate: '2025-05-15', priority: 'Medium', status: 'Completed', assignedTo: 'Alex Morgan', relatedTo: { type: 'Customer', name: 'Globex', id: 'c2' } },
];

const getPriorityColor = (p: Priority) => {
    switch(p) {
        case 'High': return 'text-danger bg-danger/10 border-danger/20';
        case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
        case 'Low': return 'text-info bg-info/10 border-info/20';
    }
};

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    today: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
    task, 
    onToggle, 
    onEdit, 
    today 
}) => (
  <div className={cn(
      "group flex items-start gap-4 p-4 border border-white/5 bg-obsidian-card rounded-sm hover:border-brand/30 transition-all",
      task.status === 'Completed' && "opacity-60 bg-white/[0.01]"
  )}>
      <button 
          onClick={() => onToggle(task.id)}
          className={cn(
              "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
              task.status === 'Completed' ? "bg-success border-success text-obsidian-outer" : "border-zinc-muted hover:border-brand text-transparent"
          )}
      >
          <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
      </button>
      
      <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
              <span className={cn("text-sm font-bold text-zinc-text leading-tight", task.status === 'Completed' && "line-through text-zinc-muted")}>
                  {task.title}
              </span>
              <div className="flex items-center gap-2 ml-4">
                  <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tight", getPriorityColor(task.priority))}>
                      {task.priority}
                  </span>
                  <button onClick={() => onEdit(task)} className="p-1 text-zinc-muted hover:text-zinc-text opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                  </button>
              </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-muted mt-2">
              <div className={cn("flex items-center gap-1.5", task.dueDate < today && task.status !== 'Completed' ? "text-danger font-bold" : "")}>
                  <Calendar className="w-3 h-3" />
                  <span>{task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}</span>
              </div>
              {task.relatedTo && (
                  <div className="flex items-center gap-1.5 text-brand bg-brand/5 px-2 py-0.5 rounded">
                      <LinkIcon className="w-3 h-3" />
                      <span className="uppercase tracking-wide font-bold">{task.relatedTo.type}: {task.relatedTo.name}</span>
                  </div>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-text border border-white/5">
                      {task.assignedTo.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{task.assignedTo}</span>
              </div>
          </div>
      </div>
  </div>
);

export const Tasks = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // SlideOver
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: 'Alex Morgan'
  });

  // --- Handlers ---
  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'Pending' ? 'Completed' : 'Pending' } : t
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setIsFormOpen(false);
    }
  };

  const handleSave = () => {
    if (!formData.title) return;

    if (editingTask) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...formData } as Task : t));
    } else {
        const newTask: Task = {
            id: `T-${Date.now()}`,
            title: formData.title!,
            description: formData.description,
            dueDate: formData.dueDate!,
            dueTime: formData.dueTime,
            priority: (formData.priority as Priority) || 'Medium',
            status: 'Pending',
            assignedTo: formData.assignedTo || 'Current User',
            relatedTo: formData.relatedTo
        };
        setTasks([newTask, ...tasks]);
    }
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({ title: '', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0], assignedTo: 'Alex Morgan' });
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({ ...task });
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData({ title: '', priority: 'Medium', dueDate: new Date().toISOString().split('T')[0], assignedTo: 'Alex Morgan' });
    setIsFormOpen(true);
  };

  // --- Grouping Logic ---
  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchPrior = filterPriority === 'All' || t.priority === filterPriority;
        const matchAssign = filterAssignee === 'All' || t.assignedTo === filterAssignee;
        const matchStatus = showCompleted ? true : t.status === 'Pending';
        return matchSearch && matchPrior && matchAssign && matchStatus;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee, showCompleted]);

  const groups = useMemo(() => {
    const g = {
        Overdue: [] as Task[],
        Today: [] as Task[],
        Upcoming: [] as Task[],
        Completed: [] as Task[]
    };

    filteredTasks.forEach(t => {
        if (t.status === 'Completed') {
            g.Completed.push(t);
        } else if (t.dueDate < today) {
            g.Overdue.push(t);
        } else if (t.dueDate === today) {
            g.Today.push(t);
        } else {
            g.Upcoming.push(t);
        }
    });
    
    // Sort logic: Overdue (oldest first), Others (soonest first)
    g.Overdue.sort((a,b) => a.dueDate.localeCompare(b.dueDate));
    g.Today.sort((a,b) => (a.dueTime || '00:00').localeCompare(b.dueTime || '00:00'));
    g.Upcoming.sort((a,b) => a.dueDate.localeCompare(b.dueDate));

    return g;
  }, [filteredTasks, today]);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ListTodo className="w-5 h-5 text-brand" />
                    <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Tasks & Activities</h1>
                </div>
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage your daily agenda</p>
            </div>
            <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest cursor-pointer mr-2">
                    <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className="accent-brand" />
                    Show Completed
                </label>
                <AmberButton size="sm" onClick={openCreate}>
                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Task
                </AmberButton>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 items-center shrink-0">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                <input 
                    type="text" 
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
                />
            </div>
            <AmberDropdown 
                label="Priority"
                options={['All', 'High', 'Medium', 'Low'].map(p => ({label: p, value: p}))}
                value={filterPriority}
                onChange={setFilterPriority}
                className="w-full sm:w-40"
            />
            <AmberDropdown 
                label="Assignee"
                options={['All', 'Alex Morgan', 'Sarah Chen', 'James Wilson'].map(p => ({label: p, value: p}))}
                value={filterAssignee}
                onChange={setFilterAssignee}
                className="w-full sm:w-48"
            />
            <button className="h-9 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
                <Filter className="w-4 h-4" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            {/* Overdue */}
            {groups.Overdue.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-danger/20">
                        <AlertTriangle className="w-4 h-4 text-danger" />
                        <h3 className="text-xs font-black text-danger uppercase tracking-widest">Overdue ({groups.Overdue.length})</h3>
                    </div>
                    <div className="grid gap-3">
                        {groups.Overdue.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={openEdit} 
                                today={today} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Today */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-brand/20">
                    <Clock className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-brand uppercase tracking-widest">Due Today ({groups.Today.length})</h3>
                </div>
                {groups.Today.length > 0 ? (
                    <div className="grid gap-3">
                        {groups.Today.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={openEdit} 
                                today={today} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-sm text-zinc-muted text-xs italic">
                        No tasks due today.
                    </div>
                )}
            </div>

            {/* Upcoming */}
            {groups.Upcoming.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Calendar className="w-4 h-4 text-zinc-muted" />
                        <h3 className="text-xs font-black text-zinc-muted uppercase tracking-widest">Upcoming ({groups.Upcoming.length})</h3>
                    </div>
                    <div className="grid gap-3">
                        {groups.Upcoming.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={openEdit} 
                                today={today} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed */}
            {showCompleted && groups.Completed.length > 0 && (
                <div className="space-y-3 pt-4 opacity-70">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <h3 className="text-xs font-black text-success uppercase tracking-widest">Completed</h3>
                    </div>
                    <div className="grid gap-3">
                        {groups.Completed.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={handleToggleComplete} 
                                onEdit={openEdit} 
                                today={today} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Add/Edit Modal */}
        <AmberSlideOver
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            title={editingTask ? "Edit Task" : "New Task"}
            description="Manage your activity and schedule."
            footer={
                <div className="flex justify-between w-full">
                    {editingTask ? (
                        <AmberButton variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => handleDelete(editingTask.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </AmberButton>
                    ) : (
                        <AmberButton variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</AmberButton>
                    )}
                    <AmberButton onClick={handleSave}>
                        {editingTask ? 'Update Task' : 'Create Task'}
                    </AmberButton>
                </div>
            }
        >
            <div className="space-y-6">
                <AmberInput 
                    label="Title"
                    placeholder="e.g. Call client regarding contract"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    autoFocus
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <AmberInput 
                        label="Due Date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                    <AmberInput 
                        label="Time (Optional)"
                        type="time"
                        value={formData.dueTime}
                        onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Priority</label>
                        <AmberDropdown 
                            options={['High', 'Medium', 'Low'].map(v => ({label: v, value: v}))}
                            value={formData.priority || 'Medium'}
                            onChange={(val) => setFormData({...formData, priority: val as Priority})}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Assignee</label>
                        <AmberDropdown 
                            options={['Alex Morgan', 'Sarah Chen', 'James Wilson'].map(v => ({label: v, value: v}))}
                            value={formData.assignedTo || 'Alex Morgan'}
                            onChange={(val) => setFormData({...formData, assignedTo: val})}
                            className="w-full"
                        />
                    </div>
                </div>

                <AmberInput 
                    label="Description / Notes"
                    multiline
                    rows={4}
                    placeholder="Add details..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
        </AmberSlideOver>
    </div>
  );
};
