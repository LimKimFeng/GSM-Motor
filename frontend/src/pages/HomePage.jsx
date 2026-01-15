import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, Shield, Headphones, Sparkles, Zap, Gift } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { bannersAPI, productsAPI } from '../services/api';

export default function HomePage() {
    const [banners, setBanners] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannersRes, productsRes, categoriesRes] = await Promise.all([
                    bannersAPI.list(),
                    productsAPI.list({ per_page: 12 }),
                    productsAPI.categories(),
                ]);

                setBanners(bannersRes.data.data || []);
                setLatestProducts(productsRes.data.data || []);
                setCategories(categoriesRes.data.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [banners.length]);

    const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
    const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

    const getImageUrl = (path) => {
        return path
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/uploads/${path}`
            : '/placeholder-banner.webp';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light">
                <div className="flex flex-col items-center gap-4">
                    <div className="spinner"></div>
                    <p className="text-muted font-medium">Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animate-fade-in" style={{ background: 'var(--color-neutral-50)' }}>
            {/* Hero Banner Carousel */}
            {banners.length > 0 && (
                <section className="hero relative overflow-hidden" style={{ height: '500px' }}>
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className="absolute inset-0 transition-slow"
                            style={{
                                opacity: index === currentBanner ? 1 : 0,
                                transform: index === currentBanner ? 'scale(1)' : 'scale(1.05)',
                                transition: 'all 0.7s ease-out'
                            }}
                        >
                            <img
                                src={getImageUrl(banner.image_path)}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                            />
                            <div className="hero-overlay" />
                            {banner.title && (
                                <div className="hero-content" style={{ position: 'absolute', bottom: '4rem', left: '2rem' }}>
                                    <h2
                                        className="font-bold text-white mb-4"
                                        style={{ fontSize: 'clamp(1.75rem, 5vw, 3.75rem)', lineHeight: '1.1' }}
                                    >
                                        {banner.title}
                                    </h2>
                                    <Link to="/produk" className="btn btn-primary">
                                        Lihat Produk
                                        <ArrowRight style={{ width: '20px', height: '20px' }} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}

                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={prevBanner}
                                className="flex items-center justify-center rounded-full transition"
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <ChevronLeft style={{ width: '24px', height: '24px', color: 'white' }} />
                            </button>
                            <button
                                onClick={nextBanner}
                                className="flex items-center justify-center rounded-full transition"
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <ChevronRight style={{ width: '24px', height: '24px', color: 'white' }} />
                            </button>

                            <div
                                className="flex gap-2"
                                style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }}
                            >
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentBanner(index)}
                                        className="rounded-full transition"
                                        style={{
                                            height: '8px',
                                            width: index === currentBanner ? '32px' : '8px',
                                            background: index === currentBanner ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.4)'
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* Features */}
            <section className="py-12 bg-white border-b" style={{ borderColor: 'var(--color-neutral-100)' }}>
                <div className="container">
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        {[
                            { icon: Truck, title: 'Pengiriman Cepat', desc: 'JNE, J&T, Grab, Gojek', color: 'blue' },
                            { icon: Shield, title: 'Produk Berkualitas', desc: 'Garansi 100% Original', color: 'green' },
                            { icon: Headphones, title: 'Layanan 24/7', desc: 'Chat WhatsApp Anytime', color: 'orange' },
                        ].map((feature, idx) => (
                            <div key={idx} className="feature-card">
                                <div className={`feature-icon ${feature.color}`}>
                                    <feature.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-muted">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="py-16" style={{ background: 'var(--color-neutral-50)' }}>
                    <div className="container">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                                    Kategori Produk
                                </h2>
                                <p className="text-muted mt-1">Temukan sparepart sesuai kebutuhan motor Anda</p>
                            </div>
                            <Link to="/produk" className="hidden md:flex items-center gap-2 text-primary font-semibold">
                                Lihat Semua
                                <ArrowRight style={{ width: '16px', height: '16px' }} />
                            </Link>
                        </div>

                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                            {categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/kategori/${category.slug}`}
                                    className="card p-6 transition"
                                >
                                    <div
                                        className="flex items-center justify-center rounded-xl mb-4"
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            background: 'rgba(255, 107, 53, 0.1)'
                                        }}
                                    >
                                        <span className="text-xl font-bold text-primary">
                                            {category.name.charAt(0)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm" style={{ color: 'var(--color-neutral-800)' }}>
                                        {category.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest Products */}
            <section className="py-16 bg-white">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                                    Terbaru
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                                Produk Terbaru
                            </h2>
                        </div>
                        <Link
                            to="/produk"
                            className="hidden md:flex btn btn-secondary"
                        >
                            Lihat Semua
                            <ArrowRight style={{ width: '16px', height: '16px' }} />
                        </Link>
                    </div>

                    <div className="products-grid">
                        {latestProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <Link to="/produk" className="md:hidden btn btn-primary w-full mt-8">
                        Lihat Semua Produk
                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </Link>
                </div>
            </section>

            {/* Promo Cards */}
            <section className="py-16" style={{ background: 'var(--color-neutral-50)' }}>
                <div className="container">
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* Promo Card 1 */}
                        <div className="promo-card promo-card-primary relative overflow-hidden">
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap style={{ width: '20px', height: '20px', color: '#FDE047' }} />
                                    <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Flash Sale
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Diskon Spesial</h3>
                                <p className="mb-6" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '280px' }}>
                                    Beli lebih banyak, hemat lebih besar! Promo terbatas.
                                </p>
                                <Link to="/produk" className="btn" style={{ background: 'white', color: 'var(--color-primary)' }}>
                                    Belanja Sekarang
                                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                                </Link>
                            </div>
                            {/* Decorative */}
                            <div
                                className="rounded-full"
                                style={{
                                    position: 'absolute',
                                    bottom: '-4rem',
                                    right: '-4rem',
                                    width: '16rem',
                                    height: '16rem',
                                    background: 'rgba(255,255,255,0.1)'
                                }}
                            />
                        </div>

                        {/* Promo Card 2 */}
                        <div className="promo-card promo-card-dark relative overflow-hidden">
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Gift style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                                    <span className="text-sm font-semibold uppercase tracking-wide text-muted">
                                        Member Benefit
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Daftar & Dapatkan</h3>
                                <p className="mb-6 text-muted" style={{ maxWidth: '280px' }}>
                                    Nikmati harga khusus member dan notifikasi promo eksklusif.
                                </p>
                                <Link to="/register" className="btn btn-primary">
                                    Daftar Gratis
                                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Butuh Sparepart Motor?
                    </h2>
                    <p className="text-lg mb-8 mx-auto" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '42rem' }}>
                        1.300+ produk tersedia dengan harga terjangkau. Garansi 100% original!
                    </p>
                    <div className="flex flex-col sm:flex gap-4 justify-center" style={{ flexDirection: 'row' }}>
                        <Link to="/produk" className="btn shadow-xl" style={{ background: 'white', color: 'var(--color-primary)' }}>
                            Lihat Katalog
                            <ArrowRight style={{ width: '20px', height: '20px' }} />
                        </Link>
                        <a
                            href="https://wa.me/6281386363979"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(4px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            Chat WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
