import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    Search, ShoppingCart, User, Menu, X, ChevronDown,
    Home, Package, LogOut, Settings, Truck
} from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '../context/store';
import { productsAPI } from '../services/api';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { count, fetchCount } = useCartStore();
    const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCount();
        }
    }, [isAuthenticated, fetchCount]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            try {
                const response = await productsAPI.search(query);
                setSearchResults(response.data.results || []);
                setShowSearch(true);
            } catch (error) {
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setShowSearch(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/produk?search=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            closeMobileMenu();
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setShowUserMenu(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Top bar */}
            <div className="bg-gsm-orange text-white py-1.5">
                <div className="container mx-auto px-4 flex justify-between items-center text-xs">
                    <span>Selamat datang di GSM Motor! 🏍️</span>
                    <a
                        href={`https://wa.me/6281386363979`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        Hubungi Kami: 0813-8636-3979
                    </a>
                </div>
            </div>

            {/* Main navbar */}
            <nav className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                            <span className="text-white font-bold text-lg">GSM</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg text-gray-800">GSM Motor</h1>
                            <p className="text-xs text-gray-500">Sparepart Motor Terlengkap</p>
                        </div>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:block flex-1 max-w-xl relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Cari sparepart..."
                                    className="w-full px-4 py-2.5 pl-11 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsm-orange/20 focus:border-gsm-orange"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {showSearch && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/produk/${product.slug}`}
                                        onClick={() => setShowSearch(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <img
                                            src={product.image_path ? `/api/uploads/${product.image_path}` : '/placeholder.webp'}
                                            alt={product.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                            <p className="text-gsm-orange text-sm font-semibold">
                                                Rp {product.price?.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <Link
                            to="/keranjang"
                            className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-600" />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gsm-orange text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gsm-orange" />
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                        {user?.name}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="font-medium text-sm">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Home className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Package className="w-4 h-4" />
                                                Pesanan Saya
                                            </Link>
                                            <Link
                                                to="/profil"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Pengaturan Profil
                                            </Link>

                                            {(user?.role === 'admin' || user?.role === 'subadmin') && (
                                                <>
                                                    <hr className="my-1" />
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gsm-orange hover:bg-orange-50"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        Panel Admin
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Keluar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:block">
                                    Daftar
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2.5 rounded-lg hover:bg-gray-100 md:hidden"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="mt-3 md:hidden">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Cari sparepart..."
                                className="w-full px-4 py-2.5 pl-11 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsm-orange/20 focus:border-gsm-orange"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </form>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="container mx-auto px-4 py-4 space-y-2">
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50"
                        >
                            <Home className="w-5 h-5 text-gray-500" />
                            Beranda
                        </Link>
                        <Link
                            to="/produk"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50"
                        >
                            <Package className="w-5 h-5 text-gray-500" />
                            Semua Produk
                        </Link>
                        <Link
                            to="/keranjang"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-500" />
                            Keranjang
                            {count > 0 && (
                                <span className="ml-auto bg-gsm-orange text-white text-xs px-2 py-0.5 rounded-full">
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
