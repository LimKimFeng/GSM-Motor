import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Folder, Image, DollarSign,
    ChevronLeft, Menu, X, LogOut, Home
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
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="p-2">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                        <span className="text-white font-bold text-sm">GSM</span>
                    </div>
                    <span className="font-bold">Admin</span>
                </div>
                <Link to="/" className="p-2">
                    <Home className="w-5 h-5 text-gray-500" />
                </Link>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                            <span className="text-white font-bold">GSM</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">GSM Motor</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive(item.path, item.exact)
                                            ? 'bg-gsm-orange text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="font-medium text-gray-600">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Toko
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
