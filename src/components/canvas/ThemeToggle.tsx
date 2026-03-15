import { Sun, Moon, Clock } from 'lucide-react';
import { ThemeMode } from '@/hooks/useTheme';

interface ThemeToggleProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

const modes: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'auto', icon: Clock, label: 'Auto' },
];

export function ThemeToggle({ mode, onModeChange }: ThemeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`p-1.5 rounded-md transition-all ${
            mode === m.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={m.label}
        >
          <m.icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
