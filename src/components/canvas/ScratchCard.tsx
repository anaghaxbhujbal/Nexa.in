import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Type, AlignLeft } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';
import { ConnectorHandle } from './ConnectorHandle';

interface ScratchCardProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onStartConnect: (id: string) => void;
  onEndConnect: (id: string) => void;
  isConnecting: boolean;
}

export function ScratchCard({ item, onUpdate, onDelete, onDragStart, onStartConnect, onEndConnect, isConnecting }: ScratchCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const stats = useMemo(() => {
    const text = item.content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    return { words, chars, lines };
  }, [item.content]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute rounded-lg border border-accent bg-card shadow-sm cursor-grab active:cursor-grabbing group"
      style={{ left: item.x, top: item.y, width: item.width, minHeight: 200 }}
      onPointerDown={(e) => {
        if (isEditing) return;
        onDragStart(item.id, e);
      }}
    >
      <ConnectorHandle itemId={item.id} onStartConnect={onStartConnect} onEndConnect={onEndConnect} isConnecting={isConnecting} />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-3.5 h-3.5 text-primary" />
          <input
            className="font-display font-semibold text-sm bg-transparent outline-none text-foreground w-full"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
          />
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Writing area */}
      <div className="p-4">
        <textarea
          className="font-body text-sm bg-transparent outline-none w-full resize-none text-foreground leading-relaxed min-h-[140px]"
          value={item.content || ''}
          placeholder="Start writing freely... drafts, ideas, lyrics, dialogue, anything goes ✨"
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          style={{ minHeight: 140 }}
        />
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-[10px] font-body text-muted-foreground">
        <span className="flex items-center gap-1">
          <Type className="w-3 h-3" />
          {stats.words} words
        </span>
        <span>{stats.chars} chars</span>
        <span>{stats.lines} lines</span>
      </div>
    </motion.div>
  );
}
