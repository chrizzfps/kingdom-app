import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  FolderKanban,
  CheckSquare,
  Receipt,
  Sparkles,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from './GlobalSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRole } from '@/hooks/useRole';

// Main navigation items with module identifiers for role filtering
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', module: 'dashboard' },
  { icon: FileText, label: 'Propuestas', href: '/admin/proposals', module: 'proposals' },
  { icon: Briefcase, label: 'Portafolios', href: '/admin/portfolios', module: 'portfolios' },
  { icon: Users, label: 'Clientes', href: '/admin/clients', module: 'clients' },
  { icon: FolderKanban, label: 'Proyectos', href: '/admin/projects', module: 'projects' },
  { icon: CheckSquare, label: 'Tareas', href: '/admin/tasks', module: 'tasks' },
  { icon: Receipt, label: 'Facturas', href: '/admin/invoices', module: 'invoices' },
  { icon: Sparkles, label: 'SocialCenter', href: '/admin/social', module: 'social' },
  { icon: UserCircle, label: 'Usuarios', href: '/admin/users', module: 'users' },
  { icon: Settings, label: 'Configuración', href: '/admin/settings', module: 'settings' },
];

interface FavoriteApp {
  id: string;
  title: string;
  url: string;
  favicon: string;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { canAccess, isAdmin } = useRole();

  // Filter nav items based on role permissions
  const filteredNavItems = NAV_ITEMS.filter((item) => canAccess(item.module));

  // Favorite Apps state
  const [favoriteApps, setFavoriteApps] = useState<FavoriteApp[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');

  // Load favorites from Firestore
  useEffect(() => {
    if (!user) return;
    const loadFavorites = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'preferences', 'sidebar');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFavoriteApps(docSnap.data().favorites || []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, [user]);

  // Save favorites to Firestore
  const saveFavorites = async (apps: FavoriteApp[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'preferences', 'sidebar'), {
        favorites: apps,
      });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleAddApp = () => {
    if (!newAppTitle.trim() || !newAppUrl.trim()) return;

    const fullUrl = newAppUrl.startsWith('http') ? newAppUrl : `https://${newAppUrl}`;
    const newApp: FavoriteApp = {
      id: Date.now().toString(),
      title: newAppTitle.trim(),
      url: fullUrl,
      favicon: getFaviconUrl(fullUrl),
    };

    const updatedApps = [...favoriteApps, newApp];
    setFavoriteApps(updatedApps);
    saveFavorites(updatedApps);

    setNewAppTitle('');
    setNewAppUrl('');
    setAddDialogOpen(false);
  };

  const handleRemoveApp = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedApps = favoriteApps.filter((app) => app.id !== id);
    setFavoriteApps(updatedApps);
    saveFavorites(updatedApps);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  // Derived state for icon check
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:relative border-r bg-card h-screen flex flex-col transition-all duration-300 z-50',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-[80px]' : 'w-[260px]'
        )}
      >
        {/* Header / Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b px-4',
            collapsed ? 'justify-center px-0' : 'justify-between'
          )}
        >
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 overflow-hidden"
            onClick={onClose}
          >
            <Logo
              variant="isotipo"
              className={cn('transition-all duration-300', collapsed ? 'h-8 w-8' : 'h-8 w-8')}
              mode="auto"
            />
          </Link>
          {/* Mobile Close Button */}
          {!collapsed && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Global Search */}
        <div className={cn('px-3 py-3', collapsed && 'px-2')}>
          <GlobalSearch collapsed={collapsed} />
        </div>

        {/* MENU Section */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-none">
          {!collapsed && (
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2 block">
              Menu
            </span>
          )}
          <nav className="space-y-0.5">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                    'min-h-[44px]', // Touch-friendly minimum height
                    isActive
                      ? 'nav-item-active-forced shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed ? 'justify-center' : ''
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'scale-110')} />
                  <span
                    className={cn(
                      'whitespace-nowrap overflow-hidden transition-all duration-300',
                      collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* FAVORITE APPS Section */}
          {!collapsed && (
            <>
              <div className="flex items-center justify-between mt-6 mb-2 px-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Favorite Apps
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <nav className="space-y-0.5">
                {favoriteApps.map((app) => (
                  <div key={app.id} className="group flex items-center relative">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {app.favicon ? (
                        <img src={app.favicon} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
                      ) : (
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      )}
                      <span className="flex-1 truncate">{app.title}</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity bg-background/80 backdrop-blur-sm"
                      onClick={(e) => handleRemoveApp(app.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {favoriteApps.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-2 italic">
                    Añade tus apps favoritas
                  </p>
                )}
              </nav>
            </>
          )}
        </div>

        {/* Footer: User Profile + Controls */}
        <div className="p-3 border-t space-y-3">
          {/* User Card with Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left outline-none',
                    collapsed ? 'justify-center p-2' : 'w-full px-2 py-2'
                  )}
                >
                  <Avatar className="h-9 w-9 border ring-1 ring-border">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="text-xs bg-gray-600 text-white font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {user.displayName || 'Usuario'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={collapsed ? 'start' : 'start'}
                side={collapsed ? 'right' : 'bottom'}
                sideOffset={collapsed ? 15 : 5}
                className="w-56"
              >
                <div className="px-2 py-1.5 text-sm font-semibold opacity-50">{user.email}</div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle + Collapse */}
          <div
            className={cn('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between')}
          >
            {/* Premium Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'relative flex items-center rounded-full bg-muted transition-colors outline-none cursor-pointer',
                collapsed ? 'h-9 w-9 justify-center' : 'h-9 w-16 p-1'
              )}
              aria-label="Toggle theme"
            >
              {collapsed ? (
                isDark ? (
                  <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )
              ) : (
                <>
                  <span
                    className={cn(
                      'absolute h-6 w-6 rounded-full bg-background shadow-sm transition-all duration-300',
                      isDark ? 'left-[calc(100%-28px)]' : 'left-1'
                    )}
                  />
                  <Sun
                    className={cn(
                      'h-4 w-4 ml-1 transition-colors z-10',
                      !isDark ? 'text-yellow-500' : 'text-muted-foreground/50'
                    )}
                  />
                  <Moon
                    className={cn(
                      'h-4 w-4 ml-auto mr-1 transition-colors z-10',
                      isDark ? 'text-blue-400' : 'text-muted-foreground/50'
                    )}
                  />
                </>
              )}
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Add Favorite App Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir App Favorita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="app-title">Título</Label>
                <Input
                  id="app-title"
                  placeholder="Ej: Google, Notion..."
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">URL</Label>
                <Input
                  id="app-url"
                  placeholder="https://..."
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddApp()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddApp} disabled={!newAppTitle.trim() || !newAppUrl.trim()}>
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>
    </>
  );
}
