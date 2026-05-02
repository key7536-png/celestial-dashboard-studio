import { Moon } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-24">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Moon className="h-4 w-4 text-gold" />
          <span className="font-display text-lg">Lunara</span>
          <span className="text-xs">© {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          ✨ 별과 달이 인도하는 당신의 길
        </p>
      </div>
    </footer>
  );
}