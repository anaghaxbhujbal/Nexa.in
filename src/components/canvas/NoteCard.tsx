import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';

const colorMap: Record<string, string> = {
  default: 'border-card-border bg-card',
  sage: 'border-primary/30 bg-primary/5',
  terracotta: 'border-secondary/30 bg-secondary/5',
};

interface NoteCardProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
}

export function NoteCard({ item, onUpdate, onDelete, onDragStart }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const colorClass = colorMap[item.color || 'default'] || colorMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute rounded-lg border ${colorClass} shadow-sm cursor-grab active:cursor-grabbing group`}
      style={{ left: item.x, top: item.y, width: item.width }}
      onPointerDown={(e) => {
        if (isEditing) return;
        onDragStart(item.id, e);
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <input
            className="font-display font-semibold text-sm bg-transparent outline-none w-full text-foreground"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
          />
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <textarea
          className="font-body text-sm bg-transparent outline-none w-full resize-none text-muted-foreground leading-relaxed"
          value={item.content || ''}
          placeholder="Write something..."
          rows={3}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
      </div>
    </motion.div>
  );
}
