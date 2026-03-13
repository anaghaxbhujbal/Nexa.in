import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Board } from '@/types/canvas';

interface BoardSidebarProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onAddBoard: (name: string) => void;
}

export function BoardSidebar({ boards, activeBoardId, onSelectBoard, onAddBoard }: BoardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAddBoard(newName.trim());
      setNewName('');
      setAdding(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!collapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full bg-card border-r border-card-border flex flex-col overflow-hidden shrink-0"
          >
            <div className="p-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-sm text-foreground">Boards</h2>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 px-2 space-y-0.5">
              {boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => onSelectBoard(board.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body transition-all ${
                    board.id === activeBoardId
                      ? 'bg-primary/10 text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{board.icon}</span>
                  <span className="truncate">{board.name}</span>
                </button>
              ))}
            </nav>

            <div className="p-3 border-t border-card-border">
              {adding ? (
                <input
                  autoFocus
                  className="w-full px-3 py-2 text-sm font-body bg-muted rounded-lg outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Board name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setAdding(false);
                  }}
                  onBlur={() => { if (!newName.trim()) setAdding(false); }}
                />
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Board</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {collapsed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCollapsed(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-card-border rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
}
