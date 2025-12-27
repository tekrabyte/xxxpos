import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, Grid3x3, ShoppingCart, FileText, User } from 'lucide-react';
import { useKioskCart } from '../hooks/useKioskCart';

export default function KioskBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useKioskCart();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/categories', label: 'Kategori', icon: Grid3x3 },
    { path: '/cart', label: 'Keranjang', icon: ShoppingCart, badge: cartItemCount },
    { path: '/orders', label: 'Pesanan', icon: FileText },
    { path: '/profile', label: 'Profil', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-colors"
            >
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 ${active ? 'text-[#1D6FFF]' : 'text-gray-500'}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span 
                className={`text-xs mt-1 font-medium ${active ? 'text-[#1D6FFF]' : 'text-gray-500'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
