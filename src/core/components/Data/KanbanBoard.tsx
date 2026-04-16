
import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  MoreVertical, 
  GripVertical, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

// --- Types ---

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string; // Tailwind text color class, e.g., 'text-brand'
  bg?: string;    // Tailwind bg color class, e.g., 'bg-brand/10'
}

export interface KanbanItem {
  id: string;
  columnId: string;
  content?: React.ReactNode; // Optional if using renderCard
  [key: string]: any;        // Allow extra data for custom rendering
}

export interface DragResult {
  type: 'CARD' | 'COLUMN';
  id: string;
  sourceId: string;      // Source Column ID (for cards) or Index (for columns - simplified)
  destinationId: string; // Dest Column ID (for cards)
  index: number;         // New index in destination
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onDragEnd: (result: DragResult) => void;
  onCardClick?: (item: KanbanItem) => void;
  onAddCard?: (columnId: string) => void;
  renderCard?: (item: KanbanItem) => React.ReactNode;
  collapsible?: boolean;
  className?: string;
}

// --- Internal Components ---

const DropIndicator = ({ isVisible }: { isVisible: boolean }) => (
  <div 
    className={cn(
      "h-0.5 bg-brand w-full my-1 rounded-full transition-opacity duration-200 pointer-events-none",
      isVisible ? "opacity-100" : "opacity-0"
    )} 
  />
);

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  items,
  onDragEnd,
  onCardClick,
  onAddCard,
  renderCard,
  collapsible = true,
  className
}) => {
  // --- State ---
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<{
    type: 'CARD' | 'COLUMN' | null;
    id: string | null;
    sourceColId: string | null;
  }>({ type: null, id: null, sourceColId: null });
  
  const [dropTarget, setDropTarget] = useState<{
    colId: string | null;
    index: number | null; // visual index for indicator
  }>({ colId: null, index: null });

  // --- Derived ---
  const itemsByColumn = useMemo(() => {
    const map: Record<string, KanbanItem[]> = {};
    columns.forEach(c => map[c.id] = []);
    items.forEach(item => {
      if (map[item.columnId]) map[item.columnId].push(item);
    });
    return map;
  }, [columns, items]);

  // --- Handlers ---
  
  const toggleCollapse = (colId: string) => {
    const newSet = new Set(collapsedCols);
    if (newSet.has(colId)) newSet.delete(colId);
    else newSet.add(colId);
    setCollapsedCols(newSet);
  };

  // Drag Start
  const handleDragStart = (e: React.DragEvent, type: 'CARD' | 'COLUMN', id: string, colId?: string) => {
    e.dataTransfer.effectAllowed = 'move';
    // Set ghost image if needed, for now standard browser ghost is used
    setDragState({ type, id, sourceColId: colId || null });
    e.dataTransfer.setData('application/json', JSON.stringify({ type, id, colId }));
  };

  // Drag Over
  const handleDragOver = (e: React.DragEvent, colId: string, index?: number) => {
    e.preventDefault(); // Allow dropping
    e.stopPropagation();

    if (dragState.type === 'CARD') {
        setDropTarget({ colId, index: index ?? itemsByColumn[colId].length });
    } else if (dragState.type === 'COLUMN') {
        // Logic for column reordering previews could go here
        // For simplicity, we mostly handle card drop indicators in this version
        setDropTarget({ colId, index: 0 }); 
    }
  };

  // Drop
  const handleDrop = (e: React.DragEvent, destColId: string, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.type || !dragState.id) return;

    const finalIndex = dropIndex ?? itemsByColumn[destColId].length;

    onDragEnd({
      type: dragState.type,
      id: dragState.id,
      sourceId: dragState.sourceColId || '',
      destinationId: destColId,
      index: finalIndex
    });

    // Reset
    setDragState({ type: null, id: null, sourceColId: null });
    setDropTarget({ colId: null, index: null });
  };

  const handleDragLeave = () => {
     // Optional: Clear drop target with delay to prevent flickering
  };

  return (
    <div className={cn("flex h-full gap-4 overflow-x-auto pb-4 items-start select-none", className)}>
      {columns.map((col, colIndex) => {
        const isCollapsed = collapsedCols.has(col.id);
        const colItems = itemsByColumn[col.id];
        const isActiveDrop = dropTarget.colId === col.id && dragState.type === 'CARD';

        // --- Render Column ---
        return (
          <div 
            key={col.id}
            className={cn(
              "flex flex-col rounded-lg transition-all duration-300 bg-obsidian-panel/30 border border-white/5 backdrop-blur-sm h-full max-h-full",
              isCollapsed ? "w-12 min-w-[3rem]" : "w-80 min-w-[20rem]"
            )}
            onDragOver={(e) => {
                if (dragState.type === 'COLUMN' && dragState.id !== col.id) {
                    e.preventDefault(); // Allow column reorder drop potentially
                }
            }}
          >
            {/* Column Header */}
            <div 
              className={cn(
                "flex items-center justify-between p-3 border-b border-white/5 bg-obsidian-panel rounded-t-lg cursor-grab active:cursor-grabbing",
                isCollapsed && "flex-col gap-4 py-4 h-full cursor-pointer"
              )}
              draggable={!isCollapsed}
              onDragStart={(e) => handleDragStart(e, 'COLUMN', col.id)}
              onDrop={(e) => {
                  if (dragState.type === 'COLUMN' && dragState.id !== col.id) {
                      e.preventDefault();
                      onDragEnd({
                          type: 'COLUMN',
                          id: dragState.id,
                          sourceId: 'index', // Columns usually reordered by index
                          destinationId: 'index',
                          index: colIndex
                      });
                  }
              }}
              onClick={() => isCollapsed && toggleCollapse(col.id)}
            >
              {isCollapsed ? (
                // Collapsed Header
                <>
                  <div className="flex flex-col items-center gap-2">
                     <span className={cn("text-xs font-black", col.color)}>{colItems.length}</span>
                     <div className={cn("w-1.5 h-1.5 rounded-full", col.bg?.replace('bg-', 'bg-') || 'bg-zinc-muted')} />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="writing-mode-vertical text-xs font-bold text-zinc-muted uppercase tracking-widest whitespace-nowrap rotate-180">
                      {col.title}
                    </span>
                  </div>
                  <button className="text-zinc-muted hover:text-zinc-text"><ChevronRight className="w-4 h-4" /></button>
                </>
              ) : (
                // Expanded Header
                <>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded-sm cursor-grab active:cursor-grabbing text-zinc-muted hover:text-zinc-text opacity-50 hover:opacity-100")}>
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-tight">{col.title}</h3>
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-white/5", col.color)}>
                            {colItems.length}
                        </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onAddCard && (
                        <button 
                            onClick={() => onAddCard(col.id)}
                            className="p-1 text-zinc-muted hover:text-brand hover:bg-white/5 rounded-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    {collapsible && (
                        <button 
                            onClick={() => toggleCollapse(col.id)}
                            className="p-1 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Column Body */}
            {!isCollapsed && (
              <div 
                className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative"
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {colItems.map((item, idx) => (
                   <React.Fragment key={item.id}>
                      <DropIndicator isVisible={isActiveDrop && dropTarget.index === idx} />
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'CARD', item.id, col.id)}
                        onDragOver={(e) => handleDragOver(e, col.id, idx)}
                        onDrop={(e) => handleDrop(e, col.id, idx)}
                        onClick={() => onCardClick?.(item)}
                        className={cn(
                           "group bg-obsidian-card border border-white/5 p-3 rounded-sm shadow-sm hover:border-brand/30 hover:shadow-md cursor-grab active:cursor-grabbing transition-all",
                           dragState.id === item.id ? "opacity-40" : "opacity-100"
                        )}
                      >
                         {renderCard ? renderCard(item) : (
                            <div>
                               <p className="text-xs font-bold text-zinc-text">{item.content}</p>
                            </div>
                         )}
                      </div>
                   </React.Fragment>
                ))}
                {/* Final Drop Zone for empty columns or end of list */}
                <div 
                   className="h-full min-h-[50px] transition-colors" 
                   onDragOver={(e) => handleDragOver(e, col.id, colItems.length)}
                   onDrop={(e) => handleDrop(e, col.id, colItems.length)}
                >
                   <DropIndicator isVisible={isActiveDrop && dropTarget.index === colItems.length} />
                   {colItems.length === 0 && (
                      <div className="h-20 border-2 border-dashed border-white/5 rounded-sm flex items-center justify-center text-zinc-muted/30 text-[10px] uppercase font-bold tracking-widest">
                         Empty
                      </div>
                   )}
                </div>
              </div>
            )}

            {/* Column Footer */}
            {!isCollapsed && onAddCard && (
               <div className="p-2 border-t border-white/5">
                  <button 
                    onClick={() => onAddCard(col.id)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-muted hover:text-brand hover:bg-white/5 rounded-sm transition-all uppercase tracking-widest"
                  >
                     <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
