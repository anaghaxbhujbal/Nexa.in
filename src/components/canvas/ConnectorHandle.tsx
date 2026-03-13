import { motion } from 'framer-motion';

interface ConnectorHandleProps {
  itemId: string;
  onStartConnect: (id: string) => void;
  isConnecting: boolean;
  onEndConnect: (id: string) => void;
}

export function ConnectorHandle({ itemId, onStartConnect, isConnecting, onEndConnect }: ConnectorHandleProps) {
  return (
    <motion.div
      className="absolute -right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      whileHover={{ scale: 1.3 }}
    >
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isConnecting) {
            onEndConnect(itemId);
          } else {
            onStartConnect(itemId);
          }
        }}
        className={`w-5 h-5 rounded-full border-2 transition-colors ${
          isConnecting
            ? 'bg-primary border-primary shadow-md shadow-primary/30'
            : 'bg-card border-muted-foreground/40 hover:border-primary hover:bg-primary/10'
        }`}
      />
    </motion.div>
  );
}
