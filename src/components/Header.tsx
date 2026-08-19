import { Home, History, FileText } from "lucide-react";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground font-medium">Resultados & Estatísticas</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              aria-label="Início"
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-base font-semibold transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              activeClassName="!text-primary bg-primary/10 hover:bg-primary/15"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Início</span>
            </NavLink>
            
            <NavLink
              to="/historico"
              aria-label="Histórico"
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-base font-semibold transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              activeClassName="!text-primary bg-primary/10 hover:bg-primary/15"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">Histórico</span>
            </NavLink>

            <NavLink
              to="/estatisticas"
              aria-label="Estatísticas"
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-base font-semibold transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              activeClassName="!text-primary bg-primary/10 hover:bg-primary/15"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Estatísticas</span>
            </NavLink>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground font-semibold">Atualizado</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
