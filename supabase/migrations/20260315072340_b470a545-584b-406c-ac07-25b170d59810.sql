
-- Boards table
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Board',
  icon text NOT NULL DEFAULT '📋',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own boards" ON public.boards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Canvas items table
CREATE TABLE public.canvas_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('note', 'todo', 'image', 'scratch')),
  x double precision NOT NULL DEFAULT 200,
  y double precision NOT NULL DEFAULT 200,
  width double precision NOT NULL DEFAULT 260,
  title text NOT NULL DEFAULT '',
  content text,
  color text,
  image_url text,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.canvas_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own items" ON public.canvas_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Todo items table
CREATE TABLE public.todo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_item_id uuid REFERENCES public.canvas_items(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own todos" ON public.todo_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connections table
CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_item_id uuid REFERENCES public.canvas_items(id) ON DELETE CASCADE NOT NULL,
  to_item_id uuid REFERENCES public.canvas_items(id) ON DELETE CASCADE NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own connections" ON public.connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Music tracks storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read music" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Auth users can upload music" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'music');
CREATE POLICY "Users can delete own music" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'music' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- User saved tracks table
CREATE TABLE public.user_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'Unknown',
  storage_path text,
  external_url text,
  duration integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tracks" ON public.user_tracks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
