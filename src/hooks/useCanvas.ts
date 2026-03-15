import { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasItem, Board, TodoItem, Connection } from '@/types/canvas';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const generateId = () => crypto.randomUUID();

export function useCanvas() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [recycleBin, setRecycleBin] = useState<CanvasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Load boards from database
  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;

    const loadData = async () => {
      setLoading(true);
      const { data: dbBoards } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');

      if (!dbBoards || dbBoards.length === 0) {
        // Create default board for new user
        const { data: newBoard } = await supabase
          .from('boards')
          .insert({ user_id: user.id, name: 'My Workspace', icon: '🎨', sort_order: 0 })
          .select()
          .single();

        if (newBoard) {
          setBoards([{ id: newBoard.id, name: newBoard.name, icon: newBoard.icon, items: [], connections: [] }]);
          setActiveBoardId(newBoard.id);
        }
        setLoading(false);
        return;
      }

      // Load items and connections for all boards
      const boardIds = dbBoards.map(b => b.id);
      const [{ data: dbItems }, { data: dbTodos }, { data: dbConns }, { data: deletedItems }] = await Promise.all([
        supabase.from('canvas_items').select('*').in('board_id', boardIds).eq('is_deleted', false),
        supabase.from('todo_items').select('*').in('canvas_item_id',
          (await supabase.from('canvas_items').select('id').in('board_id', boardIds)).data?.map(i => i.id) || []
        ),
        supabase.from('connections').select('*').in('board_id', boardIds),
        supabase.from('canvas_items').select('*').in('board_id', boardIds).eq('is_deleted', true),
      ]);

      // Load todos for deleted items too
      const deletedItemIds = deletedItems?.map(i => i.id) || [];
      const { data: deletedTodos } = deletedItemIds.length > 0
        ? await supabase.from('todo_items').select('*').in('canvas_item_id', deletedItemIds)
        : { data: [] };

      const todosByItem = new Map<string, TodoItem[]>();
      [...(dbTodos || []), ...(deletedTodos || [])].forEach(t => {
        const list = todosByItem.get(t.canvas_item_id) || [];
        list.push({ id: t.id, text: t.text, completed: t.completed });
        todosByItem.set(t.canvas_item_id, list);
      });

      const mapItem = (i: any): CanvasItem => ({
        id: i.id, type: i.type, x: i.x, y: i.y, width: i.width,
        title: i.title, content: i.content, color: i.color,
        imageUrl: i.image_url,
        todos: todosByItem.get(i.id),
      });

      const loadedBoards: Board[] = dbBoards.map(b => ({
        id: b.id, name: b.name, icon: b.icon,
        items: (dbItems || []).filter(i => i.board_id === b.id).map(mapItem),
        connections: (dbConns || []).filter(c => c.board_id === b.id).map(c => ({
          id: c.id, fromId: c.from_item_id, toId: c.to_item_id, color: c.color,
        })),
      }));

      setBoards(loadedBoards);
      setActiveBoardId(loadedBoards[0].id);
      setRecycleBin((deletedItems || []).map(mapItem));
      setLoading(false);
    };

    loadData();
  }, [user]);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0] || { id: '', name: '', icon: '', items: [], connections: [] };

  const updateItems = useCallback((updater: (items: CanvasItem[]) => CanvasItem[]) => {
    setBoards(prev =>
      prev.map(b => b.id === activeBoardId ? { ...b, items: updater(b.items) } : b)
    );
  }, [activeBoardId]);

  const moveItem = useCallback((id: string, x: number, y: number) => {
    updateItems(items => items.map(item => item.id === id ? { ...item, x, y } : item));
    // Debounced save - fire and forget
    supabase.from('canvas_items').update({ x, y, updated_at: new Date().toISOString() }).eq('id', id).then();
  }, [updateItems]);

  const addNote = useCallback(async (x?: number, y?: number) => {
    if (!user) return '';
    const colors = ['rose', 'peach', 'lemon', 'mint', 'sky', 'lavender', 'sage', 'coral'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const id = generateId();
    const newNote: CanvasItem = {
      id, type: 'note',
      x: x ?? 200 + Math.random() * 200, y: y ?? 200 + Math.random() * 200,
      width: 260, title: 'New Note', content: '', color: randomColor,
    };
    updateItems(items => [...items, newNote]);
    await supabase.from('canvas_items').insert({
      id, board_id: activeBoardId, user_id: user.id,
      type: 'note', x: newNote.x, y: newNote.y, width: 260,
      title: 'New Note', content: '', color: randomColor,
    });
    return id;
  }, [updateItems, activeBoardId, user]);

  const addTodo = useCallback(async (x?: number, y?: number) => {
    if (!user) return '';
    const id = generateId();
    const newTodo: CanvasItem = {
      id, type: 'todo',
      x: x ?? 200 + Math.random() * 200, y: y ?? 200 + Math.random() * 200,
      width: 260, title: 'New List', todos: [],
    };
    updateItems(items => [...items, newTodo]);
    await supabase.from('canvas_items').insert({
      id, board_id: activeBoardId, user_id: user.id,
      type: 'todo', x: newTodo.x, y: newTodo.y, width: 260, title: 'New List',
    });
    return id;
  }, [updateItems, activeBoardId, user]);

  const addImage = useCallback(async (x?: number, y?: number) => {
    if (!user) return '';
    const id = generateId();
    const newImage: CanvasItem = {
      id, type: 'image',
      x: x ?? 200 + Math.random() * 200, y: y ?? 200 + Math.random() * 200,
      width: 240, title: 'Moodboard',
    };
    updateItems(items => [...items, newImage]);
    await supabase.from('canvas_items').insert({
      id, board_id: activeBoardId, user_id: user.id,
      type: 'image', x: newImage.x, y: newImage.y, width: 240, title: 'Moodboard',
    });
    return id;
  }, [updateItems, activeBoardId, user]);

  const addScratch = useCallback(async (x?: number, y?: number) => {
    if (!user) return '';
    const id = generateId();
    const newScratch: CanvasItem = {
      id, type: 'scratch',
      x: x ?? 200 + Math.random() * 200, y: y ?? 200 + Math.random() * 200,
      width: 340, title: 'Scratch Pad', content: '',
    };
    updateItems(items => [...items, newScratch]);
    await supabase.from('canvas_items').insert({
      id, board_id: activeBoardId, user_id: user.id,
      type: 'scratch', x: newScratch.x, y: newScratch.y, width: 340, title: 'Scratch Pad', content: '',
    });
    return id;
  }, [updateItems, activeBoardId, user]);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    updateItems(items => items.map(item => item.id === id ? { ...item, ...updates } : item));
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.x !== undefined) dbUpdates.x = updates.x;
    if (updates.y !== undefined) dbUpdates.y = updates.y;
    supabase.from('canvas_items').update(dbUpdates).eq('id', id).then();
  }, [updateItems]);

  const deleteItem = useCallback((id: string) => {
    setBoards(prev => {
      const board = prev.find(b => b.id === activeBoardId);
      const item = board?.items.find(i => i.id === id);
      if (item) {
        setRecycleBin(bin => [...bin, item]);
      }
      return prev.map(b => b.id === activeBoardId ? {
        ...b,
        items: b.items.filter(item => item.id !== id),
        connections: b.connections.filter(c => c.fromId !== id && c.toId !== id),
      } : b);
    });
    // Soft delete in DB
    supabase.from('canvas_items').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id).then();
    supabase.from('connections').delete().or(`from_item_id.eq.${id},to_item_id.eq.${id}`).then();
  }, [activeBoardId]);

  const restoreItem = useCallback((id: string) => {
    const item = recycleBin.find(i => i.id === id);
    if (!item) return;
    setRecycleBin(bin => bin.filter(i => i.id !== id));
    updateItems(items => [...items, item]);
    supabase.from('canvas_items').update({ is_deleted: false, deleted_at: null }).eq('id', id).then();
  }, [recycleBin, updateItems]);

  const permanentDeleteItem = useCallback((id: string) => {
    setRecycleBin(bin => bin.filter(i => i.id !== id));
    supabase.from('canvas_items').delete().eq('id', id).then();
  }, []);

  const emptyRecycleBin = useCallback(() => {
    const ids = recycleBin.map(i => i.id);
    setRecycleBin([]);
    if (ids.length > 0) {
      supabase.from('canvas_items').delete().in('id', ids).then();
    }
  }, [recycleBin]);

  const toggleTodo = useCallback((itemId: string, todoId: string) => {
    updateItems(items =>
      items.map(item => {
        if (item.id !== itemId) return item;
        const updatedTodos = item.todos?.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t);
        return { ...item, todos: updatedTodos };
      })
    );
    // Toggle in DB - need to read current value first
    supabase.from('todo_items').select('completed').eq('id', todoId).single().then(({ data }) => {
      if (data) supabase.from('todo_items').update({ completed: !data.completed }).eq('id', todoId).then();
    });
  }, [updateItems]);

  const addTodoItem = useCallback(async (itemId: string, text: string) => {
    if (!user) return;
    const id = generateId();
    const newTodo: TodoItem = { id, text, completed: false };
    updateItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, todos: [...(item.todos || []), newTodo] } : item
      )
    );
    await supabase.from('todo_items').insert({
      id, canvas_item_id: itemId, user_id: user.id, text, completed: false,
    });
  }, [updateItems, user]);

  const addConnection = useCallback(async (fromId: string, toId: string) => {
    if (!user || fromId === toId) return;
    const id = generateId();
    setBoards(prev =>
      prev.map(b => {
        if (b.id !== activeBoardId) return b;
        const exists = b.connections.some(c =>
          (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
        );
        if (exists) return b;
        return { ...b, connections: [...b.connections, { id, fromId, toId }] };
      })
    );
    await supabase.from('connections').insert({
      id, board_id: activeBoardId, user_id: user.id,
      from_item_id: fromId, to_item_id: toId,
    });
  }, [activeBoardId, user]);

  const deleteConnection = useCallback((id: string) => {
    setBoards(prev =>
      prev.map(b => b.id === activeBoardId ? { ...b, connections: b.connections.filter(c => c.id !== id) } : b)
    );
    supabase.from('connections').delete().eq('id', id).then();
  }, [activeBoardId]);

  const addBoard = useCallback(async (name: string) => {
    if (!user) return;
    const { data: newBoard } = await supabase
      .from('boards')
      .insert({ user_id: user.id, name, icon: '📋', sort_order: boards.length })
      .select()
      .single();

    if (newBoard) {
      const board: Board = { id: newBoard.id, name, icon: '📋', items: [], connections: [] };
      setBoards(prev => [...prev, board]);
      setActiveBoardId(newBoard.id);
    }
  }, [user, boards.length]);

  return {
    boards, activeBoard, activeBoardId, setActiveBoardId,
    moveItem, addNote, addTodo, addImage, addScratch,
    updateItem, deleteItem, toggleTodo, addTodoItem,
    addConnection, deleteConnection, addBoard,
    recycleBin, restoreItem, permanentDeleteItem, emptyRecycleBin,
    loading,
  };
}
