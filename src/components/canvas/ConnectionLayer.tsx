import { CanvasItem, Connection } from '@/types/canvas';

interface ConnectionLayerProps {
  items: CanvasItem[];
  connections: Connection[];
  onDeleteConnection: (id: string) => void;
  connectingFrom: string | null;
  mousePos: { x: number; y: number } | null;
}

function getCenter(item: CanvasItem) {
  return { x: item.x + item.width / 2, y: item.y + 60 };
}

export function ConnectionLayer({ items, connections, onDeleteConnection, connectingFrom, mousePos }: ConnectionLayerProps) {
  const fromItem = connectingFrom ? items.find(i => i.id === connectingFrom) : null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" opacity="0.6" />
        </marker>
      </defs>

      {connections.map(conn => {
        const from = items.find(i => i.id === conn.fromId);
        const to = items.find(i => i.id === conn.toId);
        if (!from || !to) return null;

        const start = getCenter(from);
        const end = getCenter(to);
        const midX = (start.x + end.x) / 2;

        return (
          <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => onDeleteConnection(conn.id)}>
            <path
              d={`M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
              className="transition-all hover:stroke-[hsl(var(--primary))] hover:stroke-opacity-100"
            />
            {/* wider invisible hit area */}
            <path
              d={`M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`}
              fill="none"
              stroke="transparent"
              strokeWidth="14"
            />
          </g>
        );
      })}

      {/* Live connecting line */}
      {fromItem && mousePos && (
        <path
          d={`M ${getCenter(fromItem).x} ${getCenter(fromItem).y} L ${mousePos.x} ${mousePos.y}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />
      )}
    </svg>
  );
}
