import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
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
        <Link to={`/produk/${product.slug}`} className="card-product">
            {/* Image Container */}
            <div className="aspect-square overflow-hidden relative" style={{ background: 'var(--color-neutral-50)' }}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="card-product-image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/placeholder.webp';
                    }}
                />

                {/* Stock Badge */}
                {product.stock < 10 && product.stock > 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span
                            className="badge"
                            style={{
                                background: 'rgba(245, 158, 11, 0.9)',
                                backdropFilter: 'blur(4px)',
                                color: 'white',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            Stok Terbatas
                        </span>
                    </div>
                )}

                {product.stock === 0 && (
                    <div
                        className="flex items-center justify-center"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <span
                            className="font-semibold rounded-xl"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            Stok Habis
                        </span>
                    </div>
                )}

                {/* Discount Badge */}
                {(product.price_3_items || product.price_5_items) && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <span
                            className="badge font-bold"
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                boxShadow: 'var(--shadow-primary)'
                            }}
                        >
                            PROMO
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <span
                        className="text-xs font-semibold uppercase tracking-wide text-primary"
                        style={{ marginBottom: '0.375rem', display: 'inline-block' }}
                    >
                        {product.category.name}
                    </span>
                )}

                {/* Name */}
                <h3
                    className="font-semibold line-clamp-2"
                    style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        minHeight: '44px',
                        marginBottom: '0.5rem',
                        color: 'var(--color-neutral-800)'
                    }}
                >
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            style={{
                                width: '14px',
                                height: '14px',
                                color: star <= 4 ? '#FBBF24' : 'var(--color-neutral-200)',
                                fill: star <= 4 ? '#FBBF24' : 'transparent'
                            }}
                        />
                    ))}
                    <span className="text-xs text-muted" style={{ marginLeft: '0.25rem' }}>(4.0)</span>
                </div>

                {/* Price */}
                <div>
                    <p className="text-lg font-bold text-primary">
                        Rp {formatPrice(product.price)}
                    </p>

                    {/* Tiered pricing indicator */}
                    {(product.price_3_items || product.price_5_items) && (
                        <div className="flex items-center gap-1 mt-1">
                            <span
                                className="rounded-full"
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    background: 'var(--color-success)'
                                }}
                            />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                                Beli banyak lebih hemat!
                            </p>
                        </div>
                    )}
                </div>

                {/* Stock indicator */}
                <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid var(--color-neutral-100)' }}
                >
                    <span
                        className="text-xs font-medium"
                        style={{
                            color: product.stock > 10
                                ? 'var(--color-success)'
                                : product.stock > 0
                                    ? 'var(--color-warning)'
                                    : 'var(--color-error)'
                        }}
                    >
                        {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
                    </span>
                    {product.stock > 0 && product.stock <= 10 && (
                        <span
                            className="text-xs font-medium rounded-full"
                            style={{
                                fontSize: '0.625rem',
                                padding: '0.125rem 0.5rem',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--color-warning)'
                            }}
                        >
                            Segera habis
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
