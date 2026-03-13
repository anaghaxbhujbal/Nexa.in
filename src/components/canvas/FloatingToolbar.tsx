import { motion } from 'framer-motion';
import { StickyNote, ListTodo, Hand, MousePointer, ImagePlus, PenLine } from 'lucide-react';

interface FloatingToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddImage: () => void;
  onAddScratch: () => void;
}

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 bg-card border border-card-border rounded-full px-2 py-2 shadow-lg shadow-foreground/5">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`p-2.5 rounded-full transition-all ${
              activeTool === tool.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {addItems.map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title={`Add ${item.label}`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
