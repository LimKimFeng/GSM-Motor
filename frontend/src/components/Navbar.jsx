import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    Search, ShoppingCart, User, Menu, X, ChevronDown,
    Home, Package, LogOut, Settings, Truck, Clock, Phone, Mail, Heart
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
    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const categoryRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
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
        // Fetch categories
        const fetchCategories = async () => {
            try {
                const response = await productsAPI.categories();
                setCategories(response.data.data || response.data.categories || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowCategories(false);
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
        <>
            {/* Main Header */}
            <header className="main-header">
                {/* Header Top - Info Bar */}
                <div className="header-top">
                    <div className="container">
                        <div className="header-top-inner">
                            <ul className="info-list">
                                <li>
                                    <Clock size={14} />
                                    <span>Buka: <strong>Senin - Minggu, 08:00 - 17:00</strong></span>
                                </li>
                                <li>
                                    <Phone size={14} />
                                    <a href="tel:+6281386363979">0813-8636-3979</a>
                                </li>
                            </ul>
                            <div className="header-top-right">
                                <div className="shipping-info">
                                    <Truck size={14} />
                                    <span>Gratis Ongkir ke Seluruh Indonesia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Upper - Logo, Search, Options */}
                <div className="header-upper">
                    <div className="container">
                        <div className="header-upper-inner">
                            {/* Logo */}
                            <Link to="/" className="logo-box">
                                <img src="/logo.webp" alt="GSM Motor" />
                                <div className="logo-text">
                                    <h1>GSM Motor</h1>
                                    <span>Sparepart Motor Terlengkap</span>
                                </div>
                            </Link>

                            {/* Search Area */}
                            <div className="search-area" ref={searchRef}>
                                <form onSubmit={handleSearchSubmit} className="search-form">
                                    <div className="search-box">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Cari sparepart motor..."
                                        />
                                        <button type="submit" className="search-btn">
                                            <Search size={20} />
                                        </button>
                                    </div>
                                </form>

                                {/* Search Results Dropdown */}
                                {showSearch && searchResults.length > 0 && (
                                    <div className="search-results-dropdown animate-slide-down">
                                        {searchResults.slice(0, 6).map((product) => (
                                            <Link
                                                key={product.id}
                                                to={`/produk/${product.slug}`}
                                                onClick={() => setShowSearch(false)}
                                                className="search-result-item"
                                            >
                                                <div className="search-result-image">
                                                    <img
                                                        src={product.image_path ? `/api/uploads/${product.image_path}` : '/placeholder.webp'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="search-result-info">
                                                    <p className="search-result-name">{product.name}</p>
                                                    <p className="search-result-price">
                                                        Rp {product.price?.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Option Icons */}
                            <ul className="option-list">
                                {/* Wishlist */}
                                <li>
                                    <Link to="/wishlist" className="option-btn">
                                        <Heart size={22} />
                                    </Link>
                                </li>
                                {/* Cart */}
                                <li>
                                    <Link to="/keranjang" className="option-btn cart-btn">
                                        <ShoppingCart size={22} />
                                        {count > 0 && (
                                            <span className="cart-count">{count > 99 ? '99+' : count}</span>
                                        )}
                                    </Link>
                                </li>
                                {/* User */}
                                <li ref={userMenuRef}>
                                    {isAuthenticated ? (
                                        <div className="user-dropdown">
                                            <button
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="option-btn user-btn"
                                            >
                                                <User size={22} />
                                                <ChevronDown
                                                    size={14}
                                                    className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`}
                                                />
                                            </button>

                                            {showUserMenu && (
                                                <div className="user-dropdown-menu animate-slide-down">
                                                    <div className="user-info">
                                                        <p className="user-name">{user?.name}</p>
                                                        <p className="user-email">{user?.email}</p>
                                                    </div>
                                                    <div className="dropdown-divider" />
                                                    <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                        <Home size={16} /> Dashboard
                                                    </Link>
                                                    <Link to="/orders" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                        <Package size={16} /> Pesanan Saya
                                                    </Link>
                                                    <Link to="/profil" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                        <Settings size={16} /> Pengaturan Profil
                                                    </Link>
                                                    {(user?.role === 'admin' || user?.role === 'subadmin') && (
                                                        <>
                                                            <div className="dropdown-divider" />
                                                            <Link to="/admin" onClick={() => setShowUserMenu(false)} className="dropdown-item text-primary">
                                                                <Truck size={16} /> Panel Admin
                                                            </Link>
                                                        </>
                                                    )}
                                                    <div className="dropdown-divider" />
                                                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                                                        <LogOut size={16} /> Keluar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link to="/login" className="option-btn">
                                            <User size={22} />
                                        </Link>
                                    )}
                                </li>
                            </ul>

                            {/* Mobile Menu Toggle */}
                            <button className="mobile-nav-toggler" onClick={toggleMobileMenu}>
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Header Lower - Navigation */}
                <div className={`header-lower ${isScrolled ? 'sticky-active' : ''}`}>
                    <div className="container">
                        <div className="header-lower-inner">
                            {/* Categories Dropdown */}
                            <div className="category-box" ref={categoryRef}>
                                <button
                                    className="category-toggle"
                                    onClick={() => setShowCategories(!showCategories)}
                                >
                                    <Menu size={18} />
                                    <span>Semua Kategori</span>
                                    <ChevronDown size={16} className={showCategories ? 'rotated' : ''} />
                                </button>

                                {showCategories && (
                                    <ul className="category-list animate-slide-down">
                                        {categories.map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    to={`/produk?category=${category.id}`}
                                                    onClick={() => setShowCategories(false)}
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                        <li className="view-all">
                                            <Link to="/produk" onClick={() => setShowCategories(false)}>
                                                Lihat Semua Produk →
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </div>

                            {/* Main Navigation */}
                            <nav className="main-menu">
                                <ul className="navigation">
                                    <li><Link to="/">Beranda</Link></li>
                                    <li><Link to="/produk">Produk</Link></li>
                                    <li><Link to="/produk?sort=newest">Terbaru</Link></li>
                                    <li><Link to="/produk?sort=popular">Terlaris</Link></li>
                                </ul>
                            </nav>

                            {/* Right Content */}
                            <div className="header-lower-right">
                                {isAuthenticated ? (
                                    <Link to="/dashboard" className="account-btn">
                                        <User size={18} />
                                        <span>Akun Saya</span>
                                    </Link>
                                ) : (
                                    <Link to="/login" className="account-btn">
                                        <User size={18} />
                                        <span>Masuk / Daftar</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="menu-backdrop" onClick={closeMobileMenu} />
                <div className="menu-box">
                    <div className="menu-header">
                        <Link to="/" className="menu-logo" onClick={closeMobileMenu}>
                            <img src="/logo.webp" alt="GSM Motor" />
                        </Link>
                        <button className="close-btn" onClick={closeMobileMenu}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Mobile Search */}
                    <div className="mobile-search">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari sparepart..."
                            />
                            <button type="submit">
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="mobile-nav">
                        <ul>
                            <li>
                                <Link to="/" onClick={closeMobileMenu}>
                                    <Home size={20} /> Beranda
                                </Link>
                            </li>
                            <li>
                                <Link to="/produk" onClick={closeMobileMenu}>
                                    <Package size={20} /> Semua Produk
                                </Link>
                            </li>
                            <li>
                                <Link to="/keranjang" onClick={closeMobileMenu}>
                                    <ShoppingCart size={20} />
                                    Keranjang
                                    {count > 0 && <span className="badge">{count}</span>}
                                </Link>
                            </li>
                        </ul>

                        {/* Categories in Mobile */}
                        <div className="mobile-categories">
                            <h4>Kategori</h4>
                            <ul>
                                {categories.slice(0, 8).map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            to={`/produk?category=${category.id}`}
                                            onClick={closeMobileMenu}
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Auth Links */}
                        <div className="mobile-auth">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" onClick={closeMobileMenu} className="auth-link">
                                        <User size={20} /> {user?.name}
                                    </Link>
                                    <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="logout-link">
                                        <LogOut size={20} /> Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={closeMobileMenu} className="btn-login-mobile">
                                        Masuk
                                    </Link>
                                    <Link to="/register" onClick={closeMobileMenu} className="btn-register-mobile">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* Contact Info */}
                    <div className="mobile-contact">
                        <h4>Hubungi Kami</h4>
                        <ul>
                            <li>
                                <Phone size={16} />
                                <a href="tel:+6281386363979">0813-8636-3979</a>
                            </li>
                            <li>
                                <Mail size={16} />
                                <a href="mailto:landpeace.07@gmail.com">landpeace.07@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}