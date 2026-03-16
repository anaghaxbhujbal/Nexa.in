import { StickyNote, ListTodo, Layout, ImagePlus, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface MobileBottomNavProps {
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddImage: () => void;
  onAddScratch: () => void;
  onToggleSidebar: () => void;
}

const NavItem = ({ icon: Icon, label, action, index }: { icon: any; label: string; action: () => void; index: number }) => {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    action();
    setTimeout(() => setTapped(false), 300);
  };

  return (
    <motion.button
      onClick={handleTap}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
      whileTap={{ scale: 0.85 }}
      className="flex flex-col items-center gap-1 text-muted-foreground active:text-foreground transition-colors relative"
    >
      <motion.div
        animate={tapped ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="text-[10px] font-display font-medium">{label}</span>
      {tapped && (
        <motion.span
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-primary/30"
        />
      )}
    </motion.button>
  );
};

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
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-card-border"
    >
      <div className="flex items-center justify-around py-3 px-4 safe-area-pb">
        {items.map((item, i) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} action={item.action} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
