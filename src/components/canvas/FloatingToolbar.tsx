import { motion } from 'framer-motion';
import { StickyNote, ListTodo, Hand, MousePointer } from 'lucide-react';

interface FloatingToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddNote: () => void;
  onAddTodo: () => void;
}

export function FloatingToolbar({ activeTool, onToolChange, onAddNote, onAddTodo }: FloatingToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
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

        <button
          onClick={onAddNote}
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Add Note"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        <button
          onClick={onAddTodo}
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title="Add Todo List"
        >
          <ListTodo className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
