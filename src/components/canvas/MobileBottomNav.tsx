import { StickyNote, ListTodo, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  onAddNote: () => void;
  onAddTodo: () => void;
  onToggleSidebar: () => void;
}

export function MobileBottomNav({ onAddNote, onAddTodo, onToggleSidebar }: MobileBottomNavProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-card-border"
    >
      <div className="flex items-center justify-around py-3 px-4">
        <button
          onClick={onToggleSidebar}
          className="flex flex-col items-center gap-1 text-muted-foreground active:text-foreground transition-colors"
        >
          <Layout className="w-5 h-5" />
          <span className="text-[10px] font-body">Boards</span>
        </button>
        <button
          onClick={onAddNote}
          className="flex flex-col items-center gap-1 text-muted-foreground active:text-foreground transition-colors"
        >
          <StickyNote className="w-5 h-5" />
          <span className="text-[10px] font-body">Note</span>
        </button>
        <button
          onClick={onAddTodo}
          className="flex flex-col items-center gap-1 text-muted-foreground active:text-foreground transition-colors"
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[10px] font-body">Task</span>
        </button>
      </div>
    </motion.div>
  );
}
