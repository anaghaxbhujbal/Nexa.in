import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvas } from '@/hooks/useCanvas';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { BoardSidebar } from '@/components/canvas/BoardSidebar';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { FloatingToolbar } from '@/components/canvas/FloatingToolbar';
import { MobileBottomNav } from '@/components/canvas/MobileBottomNav';
import { MusicPlayer } from '@/components/canvas/MusicPlayer';
import { RecycleBin } from '@/components/canvas/RecycleBin';
import { ThemeToggle } from '@/components/canvas/ThemeToggle';
import { LogOut, Trash2 } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    boards, activeBoard, activeBoardId, setActiveBoardId,
    moveItem, addNote, addTodo, addImage, addScratch,
    updateItem, deleteItem, toggleTodo, addTodoItem,
    addConnection, deleteConnection, addBoard,
    recycleBin, restoreItem, permanentDeleteItem, emptyRecycleBin,
    loading: canvasLoading,
  } = useCanvas();

  const { mode, setThemeMode } = useTheme();
  const [activeTool, setActiveTool] = useState('select');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || canvasLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <div className="font-display text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-canvas">
      <div className="hidden md:flex">
        <BoardSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onAddBoard={addBoard}
        />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative h-full w-64">
            <BoardSidebar
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={(id) => { setActiveBoardId(id); setMobileSidebarOpen(false); }}
              onAddBoard={addBoard}
            />
          </div>
        </div>
      )}

      <InfiniteCanvas
        items={activeBoard.items}
        connections={activeBoard.connections}
        activeTool={activeTool}
        onMoveItem={moveItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onToggleTodo={toggleTodo}
        onAddTodo={addTodoItem}
        onAddConnection={addConnection}
        onDeleteConnection={deleteConnection}
      />

      {/* Top-right controls */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5"
      >
        <div className="flex items-center gap-1 glass-strong rounded-xl px-1.5 py-1.5">
          <ThemeToggle mode={mode} onModeChange={setThemeMode} />
          <div className="w-px h-5 bg-border" />
          <motion.button
            onClick={() => setRecycleBinOpen(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Recycle Bin"
          >
            <Trash2 className="w-4 h-4" />
            <AnimatePresence>
              {recycleBin.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                >
                  {recycleBin.length}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <div className="w-px h-5 bg-border" />
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      <div className="hidden md:block">
        <FloatingToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onAddNote={() => addNote()}
          onAddTodo={() => addTodo()}
          onAddImage={() => addImage()}
          onAddScratch={() => addScratch()}
        />
      </div>

      <MobileBottomNav
        onAddNote={() => addNote()}
        onAddTodo={() => addTodo()}
        onAddImage={() => addImage()}
        onAddScratch={() => addScratch()}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <MusicPlayer />

      <RecycleBin
        isOpen={recycleBinOpen}
        onClose={() => setRecycleBinOpen(false)}
        items={recycleBin}
        onRestore={restoreItem}
        onPermanentDelete={permanentDeleteItem}
        onEmptyBin={emptyRecycleBin}
      />
    </div>
  );
};

export default Index;
