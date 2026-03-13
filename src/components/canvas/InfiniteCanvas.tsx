import { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasItem, Connection } from '@/types/canvas';
import { NoteCard } from './NoteCard';
import { TodoCard } from './TodoCard';
import { ImageCard } from './ImageCard';
import { ScratchCard } from './ScratchCard';
import { ConnectionLayer } from './ConnectionLayer';

interface InfiniteCanvasProps {
  items: CanvasItem[];
  connections: Connection[];
  activeTool: string;
  onMoveItem: (id: string, x: number, y: number) => void;
  onUpdateItem: (id: string, updates: Partial<CanvasItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleTodo: (itemId: string, todoId: string) => void;
  onAddTodo: (itemId: string, text: string) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onDeleteConnection: (id: string) => void;
}

export function InfiniteCanvas({
  items,
  connections,
  activeTool,
  onMoveItem,
  onUpdateItem,
  onDeleteItem,
  onToggleTodo,
  onAddTodo,
  onAddConnection,
  onDeleteConnection,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const dragRef = useRef<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleStartConnect = useCallback((id: string) => {
    setConnectingFrom(id);
  }, []);

  const handleEndConnect = useCallback((id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      onAddConnection(connectingFrom, id);
    }
    setConnectingFrom(null);
    setMousePos(null);
  }, [connectingFrom, onAddConnection]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (connectingFrom) {
      setConnectingFrom(null);
      setMousePos(null);
      return;
    }
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [activeTool, pan, connectingFrom]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (connectingFrom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left - pan.x, y: e.clientY - rect.top - pan.y });
      return;
    }
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
  }, [isPanning, onMoveItem, connectingFrom, pan]);

  const handleCanvasPointerUp = useCallback(() => {
    setIsPanning(false);
    dragRef.current = null;
  }, []);

  const handleItemDragStart = useCallback((id: string, e: React.PointerEvent) => {
    if (activeTool === 'pan' || connectingFrom) return;
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item) return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, itemX: item.x, itemY: item.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [activeTool, items, connectingFrom]);

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

  const connectorProps = {
    onStartConnect: handleStartConnect,
    onEndConnect: handleEndConnect,
    isConnecting: !!connectingFrom,
  };

  const renderItem = (item: CanvasItem) => {
    const common = {
      key: item.id,
      item,
      onUpdate: onUpdateItem,
      onDelete: onDeleteItem,
      onDragStart: handleItemDragStart,
      ...connectorProps,
    };

    switch (item.type) {
      case 'note':
        return <NoteCard {...common} />;
      case 'todo':
        return <TodoCard {...common} onToggleTodo={onToggleTodo} onAddTodo={onAddTodo} />;
      case 'image':
        return <ImageCard {...common} />;
      case 'scratch':
        return <ScratchCard {...common} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-canvas canvas-grid ${
        connectingFrom ? 'cursor-crosshair' : activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <ConnectionLayer
          items={items}
          connections={connections}
          onDeleteConnection={onDeleteConnection}
          connectingFrom={connectingFrom}
          mousePos={mousePos}
        />
        {items.map(renderItem)}
      </div>
    </div>
  );
}
