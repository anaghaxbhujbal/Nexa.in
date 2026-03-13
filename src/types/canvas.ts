export interface CanvasItem {
  id: string;
  type: 'note' | 'todo' | 'image' | 'scratch';
  x: number;
  y: number;
  width: number;
  title: string;
  content?: string;
  color?: string;
  todos?: TodoItem[];
  imageUrl?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  color?: string;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  items: CanvasItem[];
  connections: Connection[];
}
