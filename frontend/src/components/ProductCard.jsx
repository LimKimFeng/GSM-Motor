import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
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
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/placeholder.webp';
                    }}
                />

                {/* Stock Badge */}
                {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-2 left-2">
                        <span className="badge-warning">Stok Terbatas</span>
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Habis</span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gsm-orange hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gsm-orange hover:text-white transition-colors">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.category.name}
                    </span>
                )}

                {/* Name */}
                <h3 className="font-medium text-gray-800 mt-1 line-clamp-2 min-h-[48px] text-sm">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="mt-2">
                    <p className="text-gsm-orange font-bold text-lg">
                        Rp {formatPrice(product.price)}
                    </p>

                    {/* Tiered pricing indicator */}
                    {(product.price_3_items || product.price_5_items) && (
                        <p className="text-xs text-green-600 mt-0.5">
                            Beli banyak lebih hemat!
                        </p>
                    )}
                </div>

                {/* Stock */}
                <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
