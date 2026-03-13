import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';
import { ColorPicker, getColorClasses } from './ColorPicker';
import { ConnectorHandle } from './ConnectorHandle';

interface NoteCardProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onStartConnect: (id: string) => void;
  onEndConnect: (id: string) => void;
  isConnecting: boolean;
}

export function NoteCard({ item, onUpdate, onDelete, onDragStart, onStartConnect, onEndConnect, isConnecting }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const colorClass = getColorClasses(item.color || 'default');

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
      <ConnectorHandle itemId={item.id} onStartConnect={onStartConnect} onEndConnect={onEndConnect} isConnecting={isConnecting} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-1">
          <input
            className="font-display font-semibold text-sm bg-transparent outline-none w-full text-foreground"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
          />
          <ColorPicker
            currentColor={item.color || 'default'}
            onColorChange={(color) => onUpdate(item.id, { color })}
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
