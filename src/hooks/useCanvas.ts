import { useState, useCallback } from 'react';
import { CanvasItem, Board, TodoItem } from '@/types/canvas';

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultBoards: Board[] = [
  {
    id: 'board-1',
    name: 'My Workspace',
    icon: '🎨',
    items: [
      {
        id: 'note-1',
        type: 'note',
        x: 100,
        y: 120,
        width: 280,
        title: 'Welcome! 👋',
        content: 'This is your visual workspace. Drag cards around, add notes and todos, and organize your thoughts visually.',
        color: 'sage',
      },
      {
        id: 'todo-1',
        type: 'todo',
        x: 440,
        y: 140,
        width: 260,
        title: 'Getting Started',
        todos: [
          { id: 't1', text: 'Explore the canvas', completed: false },
          { id: 't2', text: 'Create a new note', completed: false },
          { id: 't3', text: 'Add a todo list', completed: true },
        ],
      },
      {
        id: 'note-2',
        type: 'note',
        x: 200,
        y: 380,
        width: 240,
        title: 'Design Ideas',
        content: 'Capture your creative thoughts here. Move this card anywhere on the canvas!',
        color: 'terracotta',
      },
    ],
  },
  {
    id: 'board-2',
    name: 'Project Alpha',
    icon: '🚀',
    items: [],
  },
  {
    id: 'board-3',
    name: 'Reading Notes',
    icon: '📚',
    items: [],
  },
];

export function useCanvas() {
  const [boards, setBoards] = useState<Board[]>(defaultBoards);
  const [activeBoardId, setActiveBoardId] = useState('board-1');

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  const updateItems = useCallback((updater: (items: CanvasItem[]) => CanvasItem[]) => {
    setBoards(prev =>
      prev.map(b => b.id === activeBoardId ? { ...b, items: updater(b.items) } : b)
    );
  }, [activeBoardId]);

  const moveItem = useCallback((id: string, x: number, y: number) => {
    updateItems(items => items.map(item => item.id === id ? { ...item, x, y } : item));
  }, [updateItems]);

  const addNote = useCallback((x?: number, y?: number) => {
    const newNote: CanvasItem = {
      id: generateId(),
      type: 'note',
      x: x ?? 200 + Math.random() * 200,
      y: y ?? 200 + Math.random() * 200,
      width: 260,
      title: 'New Note',
      content: '',
      color: 'default',
    };
    updateItems(items => [...items, newNote]);
    return newNote.id;
  }, [updateItems]);

  const addTodo = useCallback((x?: number, y?: number) => {
    const newTodo: CanvasItem = {
      id: generateId(),
      type: 'todo',
      x: x ?? 200 + Math.random() * 200,
      y: y ?? 200 + Math.random() * 200,
      width: 260,
      title: 'New List',
      todos: [],
    };
    updateItems(items => [...items, newTodo]);
    return newTodo.id;
  }, [updateItems]);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    updateItems(items => items.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [updateItems]);

  const deleteItem = useCallback((id: string) => {
    updateItems(items => items.filter(item => item.id !== id));
  }, [updateItems]);

  const toggleTodo = useCallback((itemId: string, todoId: string) => {
    updateItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              todos: item.todos?.map(t =>
                t.id === todoId ? { ...t, completed: !t.completed } : t
              ),
            }
          : item
      )
    );
  }, [updateItems]);

  const addTodoItem = useCallback((itemId: string, text: string) => {
    const newTodo: TodoItem = { id: generateId(), text, completed: false };
    updateItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, todos: [...(item.todos || []), newTodo] } : item
      )
    );
  }, [updateItems]);

  const addBoard = useCallback((name: string) => {
    const newBoard: Board = { id: generateId(), name, icon: '📋', items: [] };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  }, []);

  return {
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
  };
}
