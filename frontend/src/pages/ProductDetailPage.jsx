import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, MessageCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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
        return path
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${path}`
            : '/placeholder.webp';
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

            <div className="grid md:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-4">
                        <img
                            src={getImageUrl(images[currentImage]?.image_path)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImage(index)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${currentImage === index ? 'border-gsm-orange' : 'border-transparent'
                                        }`}
                                >
                                    <img src={getImageUrl(img.image_path)} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
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
                                className="btn-primary flex-1 flex items-center justify-center gap-2 border-2 border-orange-600 hover:border-orange-700 transition-all"
                                style={{ padding: '0.875rem' }}
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
                                className="btn-secondary flex items-center justify-center gap-2 px-4"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden sm:inline">Tanya</span>
                            </a>
                        </div>

                        <button
                            onClick={handleBuyNow}
                            disabled={product.stock === 0 || buyingNow}
                            className="btn w-full flex items-center justify-center gap-2 border-2 transition-all"
                            style={{
                                padding: '0.875rem',
                                background: product.stock === 0 || buyingNow ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                borderColor: product.stock === 0 || buyingNow ? '#94a3b8' : '#059669',
                                fontWeight: '600',
                                cursor: product.stock === 0 || buyingNow ? 'not-allowed' : 'pointer'
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
