import { useState } from 'react';
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

  if (loading || canvasLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <div className="font-display text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

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
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle mode={mode} onModeChange={setThemeMode} />
        <button
          onClick={() => setRecycleBinOpen(true)}
          className="relative p-2 rounded-lg bg-card border border-card-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
          title="Recycle Bin"
        >
          <Trash2 className="w-4 h-4" />
          {recycleBin.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {recycleBin.length}
            </span>
          )}
        </button>
        <button
          onClick={signOut}
          className="p-2 rounded-lg bg-card border border-card-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

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
