export interface CanvasItem {
  id: string;
  type: 'note' | 'todo';
  x: number;
  y: number;
  width: number;
  title: string;
  content?: string;
  color?: string;
  todos?: TodoItem[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  items: CanvasItem[];
}
