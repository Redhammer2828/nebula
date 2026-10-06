import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tags, Ticket, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/');
    }
  }, [isAuthenticated, user, isLoadingAuth, navigate]);

  if (isLoadingAuth) return <div className="pt-20 text-center text-sm text-muted-foreground">Loading...</div>;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  ];

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your cosmic commerce platform</p>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1">
            <div className="nebula-card p-3 sticky top-24">
              <nav className="space-y-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'nebula-gradient text-white' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}