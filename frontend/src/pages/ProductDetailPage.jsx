import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, MessageCircle, ChevronLeft, ChevronRight, Check, Zap } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useAuthStore, useCartStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [currentImage, setCurrentImage] = useState(0);
    const [adding, setAdding] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await productsAPI.get(slug);
                setProduct(response.data.product);
                setRelated(response.data.related || []);
                setQuantity(1);
                setCurrentImage(0);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const images = product?.images?.length > 0
        ? product.images
        : product?.image_path
            ? [{ image_path: product.image_path }]
            : [];

    const getImageUrl = (path) => {
        if (!path) return '/placeholder.webp';

        // Handle if path already contains full URL
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // Remove leading slash if present to avoid double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        // Construct the full URL
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace('/api', '');

        return `${baseUrl}/uploads/${cleanPath}`;
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

    const getEffectivePrice = () => {
        if (!product) return 0;
        if (quantity >= 5 && product.price_5_items) return product.price_5_items;
        if (quantity >= 3 && product.price_3_items) return product.price_3_items;
        return product.price;
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Silakan login terlebih dahulu');
            return;
        }

        setAdding(true);
        try {
            await addToCart(product.id, quantity);
            toast.success('Produk ditambahkan ke keranjang');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menambahkan ke keranjang');
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            toast.error('Silakan login terlebih dahulu');
            navigate('/login');
            return;
        }

        setBuyingNow(true);
        try {
            await addToCart(product.id, quantity);
            navigate('/keranjang');
            toast.success('Silakan lanjutkan checkout');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal memproses pesanan');
            setBuyingNow(false);
        }
    };

    const whatsappUrl = product
        ? `https://wa.me/6281386363979?text=${encodeURIComponent(`Halo Admin GSM Motor, saya mau tanya tentang produk *${product.name}*.`)}`
        : '';

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="aspect-square skeleton rounded-xl" />
                    <div className="space-y-4">
                        <div className="h-8 skeleton w-3/4" />
                        <div className="h-6 skeleton w-1/4" />
                        <div className="h-12 skeleton w-1/2" />
                        <div className="h-24 skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk tidak ditemukan</h2>
                <Link to="/produk" className="btn-primary">Lihat Produk Lain</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-500">
                <Link to="/" className="hover:text-gsm-orange">Beranda</Link>
                <span className="mx-2">/</span>
                <Link to="/produk" className="hover:text-gsm-orange">Produk</Link>
                {product.category && (
                    <>
                        <span className="mx-2">/</span>
                        <Link to={`/kategori/${product.category.slug}`} className="hover:text-gsm-orange">
                            {product.category.name}
                        </Link>
                    </>
                )}
            </nav>

            {/* PRODUCT DETAIL LAYOUT - SHOPEE STYLE */}
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'block',
                overflow: 'hidden'
            }}>
                {/* LEFT COLUMN - Image Gallery (45%) */}
                <div style={{
                    width: '45%',
                    float: 'left',
                    paddingRight: '30px',
                    boxSizing: 'border-box'
                }}>
                    <div
                        className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4 group"
                        style={{
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            width: '100%',
                            paddingBottom: '100%'
                        }}
                    >
                        <img
                            src={getImageUrl(images[currentImage]?.image_path)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            style={{
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'scale(1)',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                            onError={(e) => {
                                e.target.src = '/placeholder.webp';
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                        />

                        {/* Gradient Overlay */}
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                            style={{
                                transition: 'opacity 0.3s ease',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none'
                            }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
                                    style={{
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        border: '2px solid rgba(255, 107, 53, 0.1)',
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10
                                    }}
                                >
                                    <ChevronLeft className="w-6 h-6" style={{ color: '#ff6b35' }} />
                                </button>
                                <button
                                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
                                    style={{
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        border: '2px solid rgba(255, 107, 53, 0.1)',
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10
                                    }}
                                >
                                    <ChevronRight className="w-6 h-6" style={{ color: '#ff6b35' }} />
                                </button>
                            </>
                        )}

                        {/* Image Counter Badge */}
                        {images.length > 1 && (
                            <div
                                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-md"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    position: 'absolute',
                                    bottom: '16px',
                                    right: '16px',
                                    zIndex: 10
                                }}
                            >
                                {currentImage + 1} / {images.length}
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{
                            display: 'flex',
                            gap: '12px',
                            overflowX: 'auto',
                            paddingBottom: '8px'
                        }}>
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImage(index)}
                                    className="relative shrink-0 overflow-hidden rounded-xl transition-all duration-300"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        border: currentImage === index
                                            ? '3px solid #ff6b35'
                                            : '3px solid transparent',
                                        boxShadow: currentImage === index
                                            ? '0 4px 15px rgba(255, 107, 53, 0.3)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        transform: currentImage === index ? 'scale(1.05)' : 'scale(1)',
                                        opacity: currentImage === index ? 1 : 0.7,
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentImage !== index) {
                                            e.currentTarget.style.opacity = '1';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentImage !== index) {
                                            e.currentTarget.style.opacity = '0.7';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    <img
                                        src={getImageUrl(img.image_path)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/placeholder.webp';
                                        }}
                                    />

                                    {/* Active indicator overlay */}
                                    {currentImage === index && (
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"
                                            style={{
                                                pointerEvents: 'none',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - Product Details (55%) */}
                <div style={{
                    width: '55%',
                    float: 'left',
                    boxSizing: 'border-box'
                }}>
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                        {product.category?.name}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 mb-4">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="mb-6">
                        <p className="text-3xl font-bold text-gsm-orange">
                            Rp {formatPrice(getEffectivePrice())}
                        </p>
                        {quantity >= 3 && product.price_3_items && getEffectivePrice() < product.price && (
                            <p className="text-sm text-gray-500 line-through">
                                Rp {formatPrice(product.price)}
                            </p>
                        )}
                    </div>

                    {/* Tiered Pricing */}
                    {(product.price_3_items || product.price_5_items) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="font-medium text-green-800 mb-2">💰 Beli Banyak Lebih Hemat!</p>
                            <div className="space-y-1 text-sm text-green-700">
                                {product.price_3_items && (
                                    <div className="flex items-center gap-2">
                                        {quantity >= 3 && <Check className="w-4 h-4" />}
                                        <span>Beli 3+: Rp {formatPrice(product.price_3_items)}/pcs</span>
                                    </div>
                                )}
                                {product.price_5_items && (
                                    <div className="flex items-center gap-2">
                                        {quantity >= 5 && <Check className="w-4 h-4" />}
                                        <span>Beli 5+: Rp {formatPrice(product.price_5_items)}/pcs</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stock */}
                    <div className="mb-6">
                        <span className={`badge ${product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
                        </span>
                    </div>

                    {/* Quantity */}
                    {product.stock > 0 && (
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-700">Jumlah:</span>
                            <div className="flex items-center border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 hover:bg-gray-50"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                    className="w-16 text-center border-x border-gray-200 py-2 focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-2 hover:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subtotal */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-xl font-bold text-gray-800">
                                Rp {formatPrice(getEffectivePrice() * quantity)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || adding}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 transition-all duration-300"
                                style={{
                                    padding: '0.875rem',
                                    border: '2px solid #ff6b35',
                                    background: product.stock === 0 || adding
                                        ? '#cbd5e1'
                                        : 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                                    boxShadow: product.stock === 0 || adding
                                        ? 'none'
                                        : '0 4px 20px rgba(255, 107, 53, 0.4)',
                                    transform: 'scale(1)',
                                    cursor: product.stock === 0 || adding ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    if (product.stock > 0 && !adding) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 107, 53, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = product.stock === 0 || adding
                                        ? 'none'
                                        : '0 4px 20px rgba(255, 107, 53, 0.4)';
                                }}
                            >
                                {adding ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Tambah ke Keranjang
                                    </>
                                )}
                            </button>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary flex items-center justify-center gap-2 px-4 transition-all duration-300"
                                style={{
                                    border: '2px solid #10b981',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden sm:inline">Tanya</span>
                            </a>
                        </div>

                        <button
                            onClick={handleBuyNow}
                            disabled={product.stock === 0 || buyingNow}
                            className="btn w-full flex items-center justify-center gap-2 transition-all duration-300"
                            style={{
                                padding: '0.875rem',
                                background: product.stock === 0 || buyingNow
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                border: '2px solid',
                                borderColor: product.stock === 0 || buyingNow ? '#94a3b8' : '#7c3aed',
                                fontWeight: '600',
                                cursor: product.stock === 0 || buyingNow ? 'not-allowed' : 'pointer',
                                borderRadius: '12px',
                                boxShadow: product.stock === 0 || buyingNow
                                    ? 'none'
                                    : '0 4px 20px rgba(139, 92, 246, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                if (product.stock > 0 && !buyingNow) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = product.stock === 0 || buyingNow
                                    ? 'none'
                                    : '0 4px 20px rgba(139, 92, 246, 0.4)';
                            }}
                        >
                            {buyingNow ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Beli Sekarang
                                </>
                            )}
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="mt-8">
                            <h3 className="font-semibold text-gray-800 mb-2">Deskripsi</h3>
                            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Clearfix */}
            <div style={{ clear: 'both' }}></div>

            {/* Related Products */}
            {related.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Produk Terkait</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
