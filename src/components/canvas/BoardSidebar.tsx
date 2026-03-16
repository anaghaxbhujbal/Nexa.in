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
            className="h-full glass-strong flex flex-col overflow-hidden shrink-0"
          >
            <motion.div 
              className="p-4 flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="font-display font-semibold text-sm text-foreground tracking-wide">✦ Boards</h2>
              <motion.button
                onClick={() => setCollapsed(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
              {boards.map((board, i) => (
                <motion.button
                  key={board.id}
                  onClick={() => onSelectBoard(board.id)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-colors duration-200 ${
                    board.id === activeBoardId
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {board.id === activeBoardId && (
                    <motion.div
                      layoutId="activeBoardBg"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <motion.span 
                    className="relative z-10"
                    animate={board.id === activeBoardId ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {board.icon}
                  </motion.span>
                  <span className="truncate relative z-10">{board.name}</span>
                  {board.id === activeBoardId && (
                    <motion.div
                      layoutId="activeBoardDot"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            <motion.div 
              className="p-3 border-t border-card-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {adding ? (
                  <motion.input
                    key="input"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm font-body bg-muted rounded-xl outline-none text-foreground placeholder:text-muted-foreground ring-2 ring-primary/20 focus:ring-primary/40 transition-shadow"
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
                  <motion.button
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAdding(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-body text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-dashed border-border hover:border-primary/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Board</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setCollapsed(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed top-4 left-4 z-50 p-2.5 glass-strong rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
