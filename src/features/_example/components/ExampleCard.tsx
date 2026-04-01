import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Folder } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { ExampleItem } from '../types';

interface ExampleCardProps {
  item: ExampleItem;
}

const statusConfig = {
  active: { label: 'Active', color: 'text-success' },
  inactive: { label: 'Inactive', color: 'text-zinc-muted' },
  pending: { label: 'Pending', color: 'text-warning' }
};

export const ExampleCard: React.FC<ExampleCardProps> = ({ item }) => {
  const status = statusConfig[item.status];

  return (
    <AmberCard className="hover:border-zinc-secondary/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link to={`/example/${item.id}`}>
            <h3 className="text-sm font-bold text-zinc-text hover:text-brand transition-colors">
              {item.title}
            </h3>
          </Link>
          <p className="text-[10px] text-zinc-muted mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-zinc-muted">
        <div className="flex items-center gap-1">
          <Folder className="w-3 h-3" />
          <span>{item.category}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
        <Link to={`/example/${item.id}`} className="flex-1">
          <AmberButton variant="outline" size="sm" className="w-full">
            View
          </AmberButton>
        </Link>
        <Link to={`/example/${item.id}/edit`} className="flex-1">
          <AmberButton variant="ghost" size="sm" className="w-full">
            Edit
          </AmberButton>
        </Link>
      </div>
    </AmberCard>
  );
};
