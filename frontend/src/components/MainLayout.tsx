import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin, useGetRoleMenuAccess } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Store,
  Menu,
  LogOut,
  User,
  Warehouse,
  Tag,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: menuAccess, isLoading: menuAccessLoading } = useGetRoleMenuAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isOwner = isAdmin;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Helper function to check if a menu is accessible
  const isMenuAccessible = (menuKey: string): boolean => {
    if (menuAccessLoading || !menuAccess) return false;
    const menuItem = menuAccess.find(m => m.menu === menuKey);
    return menuItem ? menuItem.isAccessible : false;
  };

  // Define all possible navigation items
  const allNavigationItems = [
    { name: 'Dashboard', page: 'dashboard', icon: LayoutDashboard, menuKey: 'dashboard' },
    { name: 'Kasir (POS)', page: 'pos', icon: ShoppingCart, menuKey: 'pos' },
    { name: 'Produk', page: 'products', icon: Package, menuKey: 'products' },
    { name: 'Manajemen Stok', page: 'stock', icon: Warehouse, menuKey: 'stock' },
    { name: 'Kategori & Brand', page: 'categories-brands', icon: Tag, menuKey: 'categories' },
    { name: 'Laporan', page: 'reports', icon: FileText, menuKey: 'reports' },
    { name: 'Outlet', page: 'outlets', icon: Store, menuKey: 'outlets' },
    { name: 'Manajemen Staf', page: 'staff', icon: Users, menuKey: 'staff' },
    { name: 'Pengaturan', page: 'settings', icon: Settings, menuKey: 'settings' },
  ];

  // Filter navigation based on menu access configuration
  const navigation = allNavigationItems.filter(item => isMenuAccessible(item.menuKey));

  // Redirect to first accessible page if current page is not accessible
  useEffect(() => {
    if (!menuAccessLoading && menuAccess && navigation.length > 0) {
      const currentPageAccessible = navigation.some(item => item.page === currentPage);
      if (!currentPageAccessible) {
        onNavigate(navigation[0].page);
      }
    }
  }, [menuAccess, menuAccessLoading, currentPage, navigation, onNavigate]);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.page;
        return (
          <button
            key={item.name}
            onClick={() => {
              onNavigate(item.page);
              if (mobile) setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-sm font-medium ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header - Shopee Style */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold text-primary tracking-tight">TekraERPOS</span>
                <span className="text-[10px] text-muted-foreground -mt-1">Smart Business Solution</span>
              </div>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 hover:bg-gray-100">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline font-medium">{userProfile?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isOwner ? 'Owner' : userProfile?.role === 'manager' ? 'Manager' : userProfile?.role === 'cashier' ? 'Kasir' : 'Guest'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop - Shopee Style */}
        <aside className="hidden w-64 border-r bg-white md:block">
          <nav className="flex flex-col gap-1 p-4">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container py-6">{children}</div>
        </main>
      </div>

      {/* Footer - Shopee Style */}
      <footer className="border-t bg-white py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>© 2025 TekraERPOS. All rights reserved.</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Powered by{' '}
              <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Caffeine AI
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
