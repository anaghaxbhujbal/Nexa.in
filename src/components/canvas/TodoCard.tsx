import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Check } from 'lucide-react';
import { CanvasItem } from '@/types/canvas';

interface TodoCardProps {
  item: CanvasItem;
  onUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  onToggleTodo: (itemId: string, todoId: string) => void;
  onAddTodo: (itemId: string, text: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
}

export function TodoCard({ item, onUpdate, onDelete, onToggleTodo, onAddTodo, onDragStart }: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');

  const completedCount = item.todos?.filter(t => t.completed).length || 0;
  const totalCount = item.todos?.length || 0;

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo(item.id, newTodoText.trim());
      setNewTodoText('');
    }
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <input
            className="font-display font-semibold text-sm bg-transparent outline-none w-full text-foreground"
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

        {totalCount > 0 && (
          <div className="mb-3">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-body">
              {completedCount}/{totalCount} done
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          {item.todos?.map(todo => (
            <button
              key={todo.id}
              onClick={() => onToggleTodo(item.id, todo.id)}
              className="flex items-center gap-2 w-full text-left group/todo"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                todo.completed ? 'bg-primary border-primary' : 'border-input hover:border-primary'
              }`}>
                {todo.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className={`text-sm font-body transition-all ${
                todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {todo.text}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            className="flex-1 text-sm font-body bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Add a task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <button
            onClick={handleAddTodo}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
