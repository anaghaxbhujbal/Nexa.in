import { useState } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { BoardSidebar } from '@/components/canvas/BoardSidebar';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { FloatingToolbar } from '@/components/canvas/FloatingToolbar';
import { MobileBottomNav } from '@/components/canvas/MobileBottomNav';

const Index = () => {
  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    moveItem,
    addNote,
    addTodo,
    updateItem,
    deleteItem,
    toggleTodo,
    addTodoItem,
    addBoard,
  } = useCanvas();

  const [activeTool, setActiveTool] = useState('select');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <BoardSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onAddBoard={addBoard}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative h-full w-64">
            <BoardSidebar
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={(id) => {
                setActiveBoardId(id);
                setMobileSidebarOpen(false);
              }}
              onAddBoard={addBoard}
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <InfiniteCanvas
        items={activeBoard.items}
        activeTool={activeTool}
        onMoveItem={moveItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onToggleTodo={toggleTodo}
        onAddTodo={addTodoItem}
      />

      {/* Desktop floating toolbar */}
      <div className="hidden md:block">
        <FloatingToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onAddNote={() => addNote()}
          onAddTodo={() => addTodo()}
        />
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        onAddNote={() => addNote()}
        onAddTodo={() => addTodo()}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
};

export default Index;
