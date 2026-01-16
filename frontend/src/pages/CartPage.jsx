import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../context/store';
import toast from 'react-hot-toast';

export default function CartPage() {
    const navigate = useNavigate();
    const { items, subtotal, fetchCart, updateItem, removeItem, isLoading } = useCartStore();
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const getImageUrl = (path) => {
        return path
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/uploads/${path}`
            : '/placeholder.webp';
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

    const handleUpdateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(id);
        try {
            await updateItem(id, newQuantity);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal memperbarui jumlah');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeItem(id);
            toast.success('Item dihapus dari keranjang');
        } catch (error) {
            toast.error('Gagal menghapus item');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
                            <div className="w-24 h-24 skeleton rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 skeleton w-3/4" />
                                <div className="h-4 skeleton w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div
                    className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    <ShoppingCart className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
                    Keranjang Belanja Kosong
                </h2>
                <p className="text-muted mb-8 max-w-md mx-auto">
                    Yuk mulai belanja dan tambahkan produk favoritmu ke keranjang!
                </p>
                <Link
                    to="/produk"
                    className="btn btn-primary inline-flex items-center gap-2"
                    style={{
                        padding: '14px 32px',
                        fontSize: '1.0625rem',
                        fontWeight: '600'
                    }}
                >
                    <ShoppingCart style={{ width: '20px', height: '20px' }} />
                    Mulai Belanja Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        const effectivePrice = product.price_5_items && item.quantity >= 5
                            ? product.price_5_items
                            : product.price_3_items && item.quantity >= 3
                                ? product.price_3_items
                                : product.price;

                        return (
                            <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4">
                                {/* Image */}
                                <Link to={`/produk/${product.slug}`} className="shrink-0">
                                    <img
                                        src={getImageUrl(product.image_path)}
                                        alt={product.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                </Link>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/produk/${product.slug}`}
                                        className="font-medium text-gray-800 hover:text-gsm-orange line-clamp-2"
                                    >
                                        {product.name}
                                    </Link>

                                    <p className="text-gsm-orange font-semibold mt-1">
                                        Rp {formatPrice(effectivePrice)}
                                    </p>

                                    {effectivePrice < product.price && (
                                        <p className="text-xs text-green-600">Harga grosir diterapkan!</p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                        {/* Quantity */}
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={updating === item.id || item.quantity <= 1}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center">
                                                {updating === item.id ? (
                                                    <div className="w-4 h-4 border-2 border-gsm-orange border-t-transparent rounded-full animate-spin mx-auto" />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={updating === item.id || item.quantity >= product.stock}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="font-semibold text-gray-800">
                                            Rp {formatPrice(effectivePrice * item.quantity)}
                                        </p>

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="lg:w-80">
                    <div className="bg-white rounded-xl p-6 sticky top-24">
                        <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Belanja</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Item</span>
                                <span>{items.reduce((acc, item) => acc + item.quantity, 0)} produk</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>Rp {formatPrice(subtotal)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span className="text-gsm-orange">Rp {formatPrice(subtotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            Checkout <ArrowRight className="w-4 h-4" />
                        </button>

                        <Link
                            to="/produk"
                            className="block text-center mt-4 text-sm text-gray-500 hover:text-gsm-orange"
                        >
                            Lanjut Belanja
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
