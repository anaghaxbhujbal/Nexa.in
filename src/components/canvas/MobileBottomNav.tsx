import { StickyNote, ListTodo, Layout, ImagePlus, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddImage: () => void;
  onAddScratch: () => void;
  onToggleSidebar: () => void;
}

export function MobileBottomNav({ onAddNote, onAddTodo, onAddImage, onAddScratch, onToggleSidebar }: MobileBottomNavProps) {
  const items = [
    { icon: Layout, label: 'Boards', action: onToggleSidebar },
    { icon: StickyNote, label: 'Note', action: onAddNote },
    { icon: ListTodo, label: 'Tasks', action: onAddTodo },
    { icon: ImagePlus, label: 'Image', action: onAddImage },
    { icon: PenLine, label: 'Scratch', action: onAddScratch },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-card-border"
    >
      <div className="flex items-center justify-around py-3 px-4">
        {items.map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex flex-col items-center gap-1 text-muted-foreground active:text-foreground transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-body">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
