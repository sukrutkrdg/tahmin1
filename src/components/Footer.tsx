import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>© 2025.</span>
          <span className="flex items-center gap-1">
            Designed with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
          </span>
          <span className="font-medium text-foreground">
            by sukrutkrdg
          </span>
        </div>
      </div>
    </footer>
  );
}