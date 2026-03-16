import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, ListTodo, Hand, MousePointer, ImagePlus, PenLine } from 'lucide-react';
import { useState } from 'react';

interface FloatingToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddImage: () => void;
  onAddScratch: () => void;
}

const ToolButton = ({ 
  isActive, onClick, icon: Icon, label, delay 
}: { 
  isActive?: boolean; onClick: () => void; icon: any; label: string; delay: number 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div className="relative" whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
      <motion.button
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative p-2.5 rounded-xl transition-colors duration-200 group ${
          isActive
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title={label}
      >
        {isActive && (
          <motion.div
            layoutId="activeToolBg"
            className="absolute inset-0 bg-primary rounded-xl"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        {!isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        )}
        <Icon className="w-4 h-4 relative z-10" />
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isPressed && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md glass text-[10px] font-display font-medium text-foreground whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AddButton = ({ onClick, icon: Icon, label, delay }: { onClick: () => void; icon: any; label: string; delay: number }) => {
  const [ripple, setRipple] = useState(false);

  const handleClick = () => {
    setRipple(true);
    onClick();
    setTimeout(() => setRipple(false), 400);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 overflow-hidden group"
      title={`Add ${label}`}
    >
      <Icon className="w-4 h-4 relative z-10" />
      <AnimatePresence>
        {ripple && (
          <motion.span
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-primary/30"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export function FloatingToolbar({ activeTool, onToolChange, onAddNote, onAddTodo, onAddImage, onAddScratch }: FloatingToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
  ];

  const addItems = [
    { icon: StickyNote, label: 'Note', action: onAddNote },
    { icon: ListTodo, label: 'Tasks', action: onAddTodo },
    { icon: ImagePlus, label: 'Image', action: onAddImage },
    { icon: PenLine, label: 'Scratch', action: onAddScratch },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div 
        className="flex items-center gap-0.5 glass-strong rounded-2xl px-2 py-1.5"
        whileHover={{ boxShadow: '0 20px 40px -12px hsl(var(--primary) / 0.15)' }}
        transition={{ duration: 0.3 }}
      >
        {tools.map((tool, i) => (
          <ToolButton
            key={tool.id}
            isActive={activeTool === tool.id}
            onClick={() => onToolChange(tool.id)}
            icon={tool.icon}
            label={tool.label}
            delay={i}
          />
        ))}

        <motion.div 
          className="w-px h-6 bg-border mx-1.5"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />

        {addItems.map((item, i) => (
          <AddButton
            key={item.label}
            onClick={item.action}
            icon={item.icon}
            label={item.label}
            delay={i + 3}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
