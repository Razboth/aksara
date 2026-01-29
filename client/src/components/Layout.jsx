import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Building2,
  Server,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Clock,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { notificationsApi } from '../api/client';
import { formatCurrency } from '../utils/format';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/transaksi', icon: Receipt },
  { name: 'Anggaran', href: '/anggaran', icon: PiggyBank },
  { name: 'Vendor', href: '/vendor', icon: Building2 },
  { name: 'Layanan', href: '/layanan', icon: Server },
  { name: 'Pengaturan', href: '/pengaturan', icon: Settings },
];

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    refetchInterval: 60000,
  });

  const { data: counts } = useQuery({
    queryKey: ['notification-count'],
    queryFn: notificationsApi.getCount,
    refetchInterval: 60000,
  });

  const totalCount = counts?.total || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-aksara-charcoal hover:text-aksara-rose hover:bg-aksara-blush/20 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-aksara-rose text-white text-xs rounded-full flex items-center justify-center">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-20 max-h-96 overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifikasi</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada notifikasi
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className={clsx(
                      'p-4 hover:bg-gray-50',
                      notif.severity === 'error' && 'bg-red-50',
                      notif.severity === 'warning' && 'bg-yellow-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {notif.type === 'overdue' && (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      {notif.type === 'due_soon' && (
                        <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      {(notif.type === 'over_budget' || notif.type === 'budget_warning') && (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-sm text-gray-600 truncate">{notif.message}</p>
                        {notif.data?.total && (
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatCurrency(notif.data.total)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-aksara-sand/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-aksara-charcoal to-neutral-800 transform transition-transform duration-200 lg:translate-x-0 shadow-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-aksara-rose to-aksara-blush rounded-xl flex items-center justify-center shadow-lg shadow-aksara-rose/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">AKSARA</h1>
              <p className="text-[10px] text-aksara-sand/80 leading-tight">Aplikasi Kontrol & Sistem<br/>Anggaran Realisasi</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 text-aksara-sand hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-aksara-rose to-aksara-rose/80 text-white shadow-lg shadow-aksara-rose/20'
                    : 'text-aksara-sand hover:bg-white/10 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-aksara-sand/60">Bank SulutGo</p>
            <p className="text-[10px] text-aksara-sand/40">Divisi Teknologi Informasi</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 text-aksara-charcoal hover:text-aksara-rose transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-aksara-taupe to-aksara-sand flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">TI</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-aksara-charcoal">Divisi TI</p>
                  <p className="text-xs text-neutral-500">Bank SulutGo</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
