import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, Shield, Headphones } from 'lucide-react';
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

    // Auto slide banners
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gsm-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Hero Banner Carousel */}
            {banners.length > 0 && (
                <section className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${index === currentBanner ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={getImageUrl(banner.image_path)}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                            {banner.title && (
                                <div className="absolute bottom-10 left-10 text-white">
                                    <h2 className="text-3xl md:text-5xl font-bold">{banner.title}</h2>
                                </div>
                            )}
                        </div>
                    ))}

                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={prevBanner}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextBanner}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentBanner(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentBanner ? 'bg-white w-6' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* Features */}
            <section className="py-8 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-gsm-orange" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Pengiriman Cepat</h3>
                                <p className="text-sm text-gray-500">JNE, J&T, Grab, Gojek</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-gsm-orange" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Produk Berkualitas</h3>
                                <p className="text-sm text-gray-500">Garansi 100% Original</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-12 h-12 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                                <Headphones className="w-6 h-6 text-gsm-orange" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Layanan 24/7</h3>
                                <p className="text-sm text-gray-500">Chat WhatsApp Anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="py-10 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Kategori Produk</h2>
                            <Link to="/produk" className="text-gsm-orange hover:underline text-sm font-medium flex items-center gap-1">
                                Lihat Semua <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/kategori/${category.slug}`}
                                    className="card p-4 text-center hover:border-gsm-orange transition-colors"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                                        <span className="text-gsm-orange font-bold">{category.name.charAt(0)}</span>
                                    </div>
                                    <h3 className="font-medium text-gray-800 text-sm">{category.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest Products */}
            <section className="py-10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Produk Terbaru</h2>
                        <Link to="/produk" className="text-gsm-orange hover:underline text-sm font-medium flex items-center gap-1">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {latestProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-16 gradient-orange">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Butuh Sparepart Motor?
                    </h2>
                    <p className="text-lg mb-8 opacity-90">
                        1.300+ produk tersedia dengan harga terjangkau!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/produk" className="btn-secondary bg-white text-gsm-orange hover:bg-gray-100">
                            Lihat Katalog
                        </Link>
                        <a
                            href="https://wa.me/6281386363979"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary border-white text-white hover:bg-white/10"
                        >
                            Chat WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
