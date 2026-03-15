import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, X, StickyNote, ListTodo, Image, PenLine } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';

interface RecycleBinProps {
  isOpen: boolean;
  onClose: () => void;
  items: CanvasItem[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyBin: () => void;
}

const typeIcons = {
  note: StickyNote,
  todo: ListTodo,
  image: Image,
  scratch: PenLine,
};

export function RecycleBin({ isOpen, onClose, items, onRestore, onPermanentDelete, onEmptyBin }: RecycleBinProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-0 right-0 h-full w-80 bg-card border-l border-card-border shadow-xl z-[60] flex flex-col"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              <h2 className="font-display font-semibold text-sm text-foreground">Recycle Bin</h2>
              <span className="text-xs font-body text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Trash2 className="w-8 h-8 mb-2 opacity-30" />
                <p className="font-body text-sm">Bin is empty</p>
              </div>
            ) : (
              items.map(item => {
                const Icon = typeIcons[item.type] || StickyNote;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-foreground truncate">{item.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground capitalize">{item.type}</p>
                    </div>
                    <button
                      onClick={() => onRestore(item.id)}
                      className="p-1.5 rounded-md hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Restore"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onPermanentDelete(item.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete permanently"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={onEmptyBin}
                className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-display font-semibold hover:bg-destructive/20 transition-colors"
              >
                Empty Recycle Bin
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
