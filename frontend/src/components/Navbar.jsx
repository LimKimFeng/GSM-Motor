import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    Search, ShoppingCart, User, Menu, X, ChevronDown,
    Home, Package, LogOut, Settings, Truck, Moon, Sun
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
    const [isScrolled, setIsScrolled] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            {/* Top Announcement Bar */}
            <div className="announcement-bar">
                <div className="container flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>🏍️</span>
                        <span>Selamat datang di GSM Motor</span>
                    </div>
                    <a
                        href="https://wa.me/6281386363979"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                    >
                        <span>📞</span>
                        0813-8636-3979
                    </a>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="container py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <div
                            className="flex items-center justify-center rounded-xl shadow-primary"
                            style={{
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 100%)'
                            }}
                        >
                            <span className="text-white font-bold" style={{ fontSize: '1.125rem' }}>GSM</span>
                        </div>
                        <div className="sm:block hidden">
                            <h1 className="font-bold" style={{ fontSize: '1.125rem', color: 'var(--color-neutral-800)' }}>
                                GSM Motor
                            </h1>
                            <p className="text-xs text-muted">
                                Sparepart Motor Terlengkap
                            </p>
                        </div>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:block flex-1" style={{ maxWidth: '32rem', position: 'relative' }} ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Cari sparepart motor..."
                                    className="input-field input-with-icon"
                                    style={{ paddingRight: '1rem' }}
                                />
                                <Search className="input-icon" />
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {showSearch && searchResults.length > 0 && (
                            <div className="search-results animate-slide-down">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/produk/${product.slug}`}
                                        onClick={() => setShowSearch(false)}
                                        className="search-result-item"
                                    >
                                        <div
                                            className="rounded-lg overflow-hidden bg-gray-100 shrink-0"
                                            style={{ width: '48px', height: '48px' }}
                                        >
                                            <img
                                                src={product.image_path ? `/api/uploads/${product.image_path}` : '/placeholder.webp'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1" style={{ minWidth: 0 }}>
                                            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-neutral-800)' }}>
                                                {product.name}
                                            </p>
                                            <p className="text-sm font-semibold text-primary">
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
                            className="btn-ghost rounded-xl"
                            style={{ position: 'relative', padding: '0.625rem' }}
                        >
                            <ShoppingCart style={{ width: '20px', height: '20px', color: 'var(--color-neutral-600)' }} />
                            {count > 0 && (
                                <span
                                    className="flex items-center justify-center rounded-full text-white font-semibold animate-fade-in"
                                    style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        width: '20px',
                                        height: '20px',
                                        fontSize: '0.75rem',
                                        background: 'var(--color-primary)',
                                        boxShadow: 'var(--shadow-primary)'
                                    }}
                                >
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="dropdown" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition"
                                    style={{ background: 'transparent' }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-xl shadow-md"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            background: 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 100%)'
                                        }}
                                    >
                                        <User style={{ width: '16px', height: '16px', color: 'white' }} />
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium truncate" style={{ maxWidth: '100px', color: 'var(--color-neutral-700)' }}>
                                        {user?.name}
                                    </span>
                                    <ChevronDown
                                        className="hidden lg:block transition"
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            color: 'var(--color-neutral-400)',
                                            transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}
                                    />
                                </button>

                                {showUserMenu && (
                                    <div className="dropdown-menu" style={{ width: '16rem' }}>
                                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-neutral-100)' }}>
                                            <p className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>{user?.name}</p>
                                            <p className="text-xs truncate text-muted">{user?.email}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <Home style={{ width: '16px', height: '16px', color: 'var(--color-neutral-400)' }} />
                                                Dashboard
                                            </Link>
                                            <Link to="/orders" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <Package style={{ width: '16px', height: '16px', color: 'var(--color-neutral-400)' }} />
                                                Pesanan Saya
                                            </Link>
                                            <Link to="/profil" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <Settings style={{ width: '16px', height: '16px', color: 'var(--color-neutral-400)' }} />
                                                Pengaturan Profil
                                            </Link>

                                            {(user?.role === 'admin' || user?.role === 'subadmin') && (
                                                <>
                                                    <div style={{ height: '1px', margin: '0.5rem 1rem', background: 'var(--color-neutral-100)' }} />
                                                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="dropdown-item text-primary">
                                                        <Truck style={{ width: '16px', height: '16px' }} />
                                                        Panel Admin
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="border-t py-2" style={{ borderColor: 'var(--color-neutral-100)' }}>
                                            <button onClick={handleLogout} className="dropdown-item w-full" style={{ color: 'var(--color-error)' }}>
                                                <LogOut style={{ width: '16px', height: '16px' }} />
                                                Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="nav-link hidden sm:block">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn btn-primary hidden sm:flex" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    Daftar
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={toggleMobileMenu}
                            className="btn-ghost md:hidden rounded-xl"
                            style={{ padding: '0.625rem' }}
                        >
                            {isMobileMenuOpen ? (
                                <X style={{ width: '20px', height: '20px', color: 'var(--color-neutral-600)' }} />
                            ) : (
                                <Menu style={{ width: '20px', height: '20px', color: 'var(--color-neutral-600)' }} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="mt-3 md:hidden">
                    <form onSubmit={handleSearchSubmit}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Cari sparepart motor..."
                                className="input-field input-with-icon"
                            />
                            <Search className="input-icon" />
                        </div>
                    </form>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t animate-slide-down" style={{ background: 'white', borderColor: 'var(--color-neutral-100)' }}>
                    <div className="container py-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Link to="/" onClick={closeMobileMenu} className="dropdown-item rounded-xl">
                            <Home style={{ width: '20px', height: '20px', color: 'var(--color-neutral-500)' }} />
                            <span className="font-medium">Beranda</span>
                        </Link>
                        <Link to="/produk" onClick={closeMobileMenu} className="dropdown-item rounded-xl">
                            <Package style={{ width: '20px', height: '20px', color: 'var(--color-neutral-500)' }} />
                            <span className="font-medium">Semua Produk</span>
                        </Link>
                        <Link to="/keranjang" onClick={closeMobileMenu} className="dropdown-item rounded-xl">
                            <ShoppingCart style={{ width: '20px', height: '20px', color: 'var(--color-neutral-500)' }} />
                            <span className="font-medium">Keranjang</span>
                            {count > 0 && (
                                <span
                                    className="ml-auto rounded-full text-white text-xs font-semibold"
                                    style={{
                                        background: 'var(--color-primary)',
                                        padding: '0.125rem 0.625rem'
                                    }}
                                >
                                    {count}
                                </span>
                            )}
                        </Link>
                        {!isAuthenticated && (
                            <>
                                <div style={{ height: '1px', margin: '0.5rem 0', background: 'var(--color-neutral-100)' }} />
                                <Link to="/login" onClick={closeMobileMenu} className="btn btn-secondary w-full">
                                    Masuk
                                </Link>
                                <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary w-full">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
