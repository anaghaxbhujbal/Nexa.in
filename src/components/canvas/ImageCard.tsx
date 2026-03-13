import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ImagePlus } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';
import { ConnectorHandle } from './ConnectorHandle';

interface ImageCardProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onStartConnect: (id: string) => void;
  onEndConnect: (id: string) => void;
  isConnecting: boolean;
}

export function ImageCard({ item, onUpdate, onDelete, onDragStart, onStartConnect, onEndConnect, isConnecting }: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate(item.id, { imageUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute rounded-lg border border-card-border bg-card shadow-sm cursor-grab active:cursor-grabbing group"
      style={{ left: item.x, top: item.y, width: item.width }}
      onPointerDown={(e) => {
        if (isEditing) return;
        onDragStart(item.id, e);
      }}
    >
      <ConnectorHandle itemId={item.id} onStartConnect={onStartConnect} onEndConnect={onEndConnect} isConnecting={isConnecting} />
      <div className="p-3">
        <div className="flex items-start justify-between mb-2 gap-1">
          <input
            className="font-display font-semibold text-xs bg-transparent outline-none w-full text-foreground"
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

        {item.imageUrl ? (
          <div className="relative rounded-md overflow-hidden">
            <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-cover rounded-md" />
            <label className="absolute inset-0 flex items-center justify-center bg-foreground/0 hover:bg-foreground/20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
              <span className="text-xs font-body text-primary-foreground bg-foreground/60 px-2 py-1 rounded">Replace</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <ImagePlus className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs font-body text-muted-foreground">Click to add image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}

        <textarea
          className="font-body text-xs bg-transparent outline-none w-full resize-none text-muted-foreground leading-relaxed mt-2"
          value={item.content || ''}
          placeholder="Add a caption..."
          rows={1}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
      </div>
    </motion.div>
  );
}
