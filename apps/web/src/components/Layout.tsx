import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUsername, isLoggedIn, logout } from "@/lib/auth";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/history", label: "History" },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const username = getUsername();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    // 刷新页面以清除所有缓存状态
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center px-6">
          <h1 className="mr-8 text-lg font-semibold">MiniMax Speed Test</h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 认证区域 */}
          <div className="ml-auto">
            {loggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-primary p-0 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {username?.charAt(0).toUpperCase() || "U"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  navigate("/login", {
                    state: { from: location.pathname },
                  })
                }
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-screen-xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
