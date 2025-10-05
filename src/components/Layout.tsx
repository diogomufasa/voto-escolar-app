import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Main Header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border backdrop-blur-sm">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-4">
              {user && <SidebarTrigger />}
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="VotoEscolar Logo"
                  className="h-10 sm:h-12 md:h-14 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!user && (
                <Button onClick={() => navigate("/auth")} variant="default" size="sm">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {user && <AppSidebar />}
        
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}