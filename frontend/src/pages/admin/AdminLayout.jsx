import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Folder, Image, DollarSign,
    ChevronLeft, Menu, X, LogOut, Home, Bell, Settings, Users
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../context/store';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/products', icon: Package, label: 'Produk' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
        { path: '/admin/categories', icon: Folder, label: 'Kategori' },
        { path: '/admin/banners', icon: Image, label: 'Banner' },
        { path: '/admin/bulk-price', icon: DollarSign, label: 'Ubah Harga' },
        { path: '/admin/subadmin-performance', icon: Users, label: 'Kinerja Subadmin' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-neutral-100)' }}>
            {/* Mobile Header */}
            <header
                className="lg:hidden flex items-center justify-between"
                style={{
                    background: 'white',
                    padding: '0.75rem 1rem',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}
            >
                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{ padding: '0.5rem', background: 'none', border: 'none' }}
                >
                    <Menu style={{ width: '24px', height: '24px', color: 'var(--color-neutral-600)' }} />
                </button>
                <div className="flex items-center gap-2">
                    <img
                        src="/logo.webp"
                        alt="GSM Motor"
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain'
                        }}
                    />
                    <span className="font-bold" style={{ color: 'var(--color-neutral-800)' }}>Admin</span>
                </div>
                <Link to="/" style={{ padding: '0.5rem' }}>
                    <Home style={{ width: '20px', height: '20px', color: 'var(--color-neutral-500)' }} />
                </Link>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0"
                    style={{ background: 'rgba(0, 0, 0, 0.5)', zIndex: 45 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className="fixed"
                style={{
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '16rem',
                    background: 'var(--color-dark-bg)',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 50,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease'
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center justify-between"
                    style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-dark-border)' }}
                >
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.webp"
                            alt="GSM Motor"
                            style={{
                                width: '44px',
                                height: '44px',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                        <div>
                            <h1 className="font-bold text-white" style={{ fontSize: '1rem' }}>GSM Motor</h1>
                            <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Admin Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                        style={{ padding: '0.25rem', background: 'none', border: 'none' }}
                    >
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-neutral-400)' }} />
                    </button>
                </div>

                {/* Menu */}
                <nav style={{ padding: '1rem' }}>
                    <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-neutral-500)', marginBottom: '0.75rem', paddingLeft: '0.75rem' }}
                    >
                        Menu
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center gap-3 rounded-xl transition"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        background: isActive(item.path, item.exact)
                                            ? 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 100%)'
                                            : 'transparent',
                                        color: isActive(item.path, item.exact) ? 'white' : 'var(--color-neutral-400)',
                                        boxShadow: isActive(item.path, item.exact) ? 'var(--shadow-primary)' : 'none',
                                        fontWeight: isActive(item.path, item.exact) ? '600' : '500',
                                        fontSize: '0.9375rem'
                                    }}
                                >
                                    <item.icon style={{ width: '20px', height: '20px' }} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1rem',
                        borderTop: '1px solid var(--color-dark-border)'
                    }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="flex items-center justify-center rounded-full shrink-0"
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--color-dark-elevated)'
                            }}
                        >
                            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                                {user?.name?.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1" style={{ minWidth: 0 }}>
                            <p className="font-medium text-sm text-white truncate">{user?.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--color-neutral-500)' }}>{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl transition"
                            style={{
                                padding: '0.625rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                background: 'var(--color-dark-elevated)',
                                color: 'var(--color-neutral-300)',
                                border: '1px solid var(--color-dark-border)'
                            }}
                        >
                            <ChevronLeft style={{ width: '16px', height: '16px' }} />
                            Toko
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center rounded-xl transition"
                            style={{
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444',
                                border: 'none'
                            }}
                        >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 0, minHeight: '100vh' }}>
                <div style={{ padding: '1.5rem' }}>
                    <Outlet />
                </div>
            </main>

            {/* Responsive Styles */}
            <style>{`
                @media (min-width: 1024px) {
                    .lg\\:hidden { display: none !important; }
                    aside { 
                        transform: translateX(0) !important;
                    }
                    main {
                        margin-left: 16rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
