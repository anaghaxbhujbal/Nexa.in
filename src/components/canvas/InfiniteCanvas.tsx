import { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasItem } from '@/types/canvas';
import { NoteCard } from './NoteCard';
import { TodoCard } from './TodoCard';

interface InfiniteCanvasProps {
  items: CanvasItem[];
  activeTool: string;
  onMoveItem: (id: string, x: number, y: number) => void;
  onUpdateItem: (id: string, updates: Partial<CanvasItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleTodo: (itemId: string, todoId: string) => void;
  onAddTodo: (itemId: string, text: string) => void;
}

export function InfiniteCanvas({
  items,
  activeTool,
  onMoveItem,
  onUpdateItem,
  onDeleteItem,
  onToggleTodo,
  onAddTodo,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const dragRef = useRef<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [activeTool, pan]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: panOrigin.current.x + (e.clientX - panStart.current.x),
        y: panOrigin.current.y + (e.clientY - panStart.current.y),
      });
      return;
    }
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      onMoveItem(dragRef.current.id, dragRef.current.itemX + dx, dragRef.current.itemY + dy);
    }
  }, [isPanning, onMoveItem]);

  const handleCanvasPointerUp = useCallback(() => {
    setIsPanning(false);
    dragRef.current = null;
  }, []);

  const handleItemDragStart = useCallback((id: string, e: React.PointerEvent) => {
    if (activeTool === 'pan') return;
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item) return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, itemX: item.x, itemY: item.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [activeTool, items]);

  // Wheel to pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-canvas canvas-dots ${
        activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        {items.map(item =>
          item.type === 'note' ? (
            <NoteCard
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onDragStart={handleItemDragStart}
            />
          ) : (
            <TodoCard
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onToggleTodo={onToggleTodo}
              onAddTodo={onAddTodo}
              onDragStart={handleItemDragStart}
            />
          )
        )}
      </div>
    </div>
  );
}
