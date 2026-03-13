import { Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const pastelColors = [
  { id: 'default', label: 'Default', bg: 'hsl(0 0% 100%)', class: 'border-card-border bg-card' },
  { id: 'rose', label: 'Rose', bg: 'hsl(350 80% 92%)', class: 'border-[hsl(350,60%,80%)] bg-[hsl(350,80%,92%)]' },
  { id: 'peach', label: 'Peach', bg: 'hsl(20 85% 90%)', class: 'border-[hsl(20,65%,78%)] bg-[hsl(20,85%,90%)]' },
  { id: 'lemon', label: 'Lemon', bg: 'hsl(50 85% 88%)', class: 'border-[hsl(50,65%,76%)] bg-[hsl(50,85%,88%)]' },
  { id: 'mint', label: 'Mint', bg: 'hsl(150 50% 88%)', class: 'border-[hsl(150,35%,76%)] bg-[hsl(150,50%,88%)]' },
  { id: 'sky', label: 'Sky', bg: 'hsl(200 70% 90%)', class: 'border-[hsl(200,50%,78%)] bg-[hsl(200,70%,90%)]' },
  { id: 'lavender', label: 'Lavender', bg: 'hsl(260 60% 92%)', class: 'border-[hsl(260,40%,80%)] bg-[hsl(260,60%,92%)]' },
  { id: 'sage', label: 'Sage', bg: 'hsl(100 30% 88%)', class: 'border-[hsl(100,22%,76%)] bg-[hsl(100,30%,88%)]' },
  { id: 'coral', label: 'Coral', bg: 'hsl(12 80% 90%)', class: 'border-[hsl(12,60%,78%)] bg-[hsl(12,80%,90%)]' },
];

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground">
          <Palette className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" side="top" align="start">
        <div className="grid grid-cols-3 gap-1.5">
          {pastelColors.map(color => (
            <button
              key={color.id}
              onClick={() => onColorChange(color.id)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                currentColor === color.id ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color.bg, borderColor: currentColor === color.id ? 'hsl(var(--primary))' : 'transparent' }}
              title={color.label}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getColorClasses(colorId: string): string {
  const color = pastelColors.find(c => c.id === colorId);
  return color?.class || pastelColors[0].class;
}
