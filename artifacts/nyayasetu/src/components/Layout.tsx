import { Link, useLocation } from "wouter";
import { Scale, MessageSquare, LayoutDashboard, ExternalLink } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chatbot", label: "NyayaSetu AI", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
          <div className="flex items-center gap-2 mr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">NyayaSetu</span>
          </div>

          <nav className="flex items-center space-x-1 flex-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <a
              href="https://services.ecourts.gov.in/ecourtindia_v6/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              eCourts Portal
            </a>
          </nav>

          <div className="ml-auto flex items-center space-x-4 text-xs text-muted-foreground font-medium border border-border px-3 py-1.5 rounded-full bg-muted/30">
            <span>Department of Justice, Govt. of India</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/20 py-4">
        <div className="container max-w-screen-2xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>
            Data sourced from{" "}
            <a href="https://njdg.ecourts.gov.in/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              National Judicial Data Grid (NJDG)
            </a>
            {" "}·{" "}
            <a href="https://ecourts.gov.in/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              eCourts Project
            </a>
          </div>
          <div>
            NyayaSetu AI · Department of Justice, Government of India
          </div>
        </div>
      </footer>
    </div>
  );
}
