import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Heart } from 'lucide-react';
import { useAuthStore, useCartStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();

    const imageUrl = product.image_path
        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/uploads/${product.image_path}`
        : '/placeholder.webp';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Silakan login terlebih dahulu');
            navigate('/login');
            return;
        }

        try {
            await addToCart(product.id, 1);
            toast.success('Produk ditambahkan ke keranjang');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menambahkan ke keranjang');
        }
    };

    return (
        <div className="shop-block">
            <div className="shop-block-inner">
                {/* Image Container */}
                <div className="shop-block-image">
                    <Link to={`/produk/${product.slug}`}>
                        <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = '/placeholder.webp';
                            }}
                        />
                    </Link>

                    {/* Stock Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                        <span className="stock-badge warning">Stok Terbatas</span>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.stock === 0 && (
                        <div className="out-of-stock-overlay">
                            <span>Stok Habis</span>
                        </div>
                    )}

                    {/* Promo Badge */}
                    {(product.price_3_items || product.price_5_items) && (
                        <span className="promo-badge">PROMO</span>
                    )}

                    {/* Hover Options */}
                    <div className="shop-block-options">
                        <button
                            onClick={handleAddToCart}
                            className="option-btn cart"
                            title="Tambah ke Keranjang"
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart size={18} />
                        </button>
                        <Link
                            to={`/produk/${product.slug}`}
                            className="option-btn view"
                            title="Lihat Detail"
                        >
                            <Eye size={18} />
                        </Link>
                        <button className="option-btn wishlist" title="Tambah ke Wishlist">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="shop-block-content">
                    {/* Category */}
                    {product.category && (
                        <span className="product-category">{product.category.name}</span>
                    )}

                    {/* Name */}
                    <h4 className="product-title">
                        <Link to={`/produk/${product.slug}`}>{product.name}</Link>
                    </h4>

                    {/* Rating */}
                    <div className="product-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={14}
                                className={star <= 4 ? 'filled' : ''}
                            />
                        ))}
                        <span className="rating-count">(4.0)</span>
                    </div>

                    {/* Price */}
                    <div className="product-price">
                        <span className="price">Rp {formatPrice(product.price)}</span>
                    </div>

                    {/* Tiered pricing indicator */}
                    {(product.price_3_items || product.price_5_items) && (
                        <div className="bulk-discount">
                            <span className="dot"></span>
                            <span>Beli banyak lebih hemat!</span>
                        </div>
                    )}

                    {/* Stock Info */}
                    <div className="stock-info">
                        <span className={`stock-status ${product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}`}>
                            {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
