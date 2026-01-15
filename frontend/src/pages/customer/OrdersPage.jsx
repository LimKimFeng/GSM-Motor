import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { ordersAPI } from '../../services/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await ordersAPI.list({ page, per_page: 10 });
                setOrders(response.data.data || []);
                setMeta(response.data.meta || {});
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [page]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const labels = {
            pending: 'Menunggu',
            processing: 'Diproses',
            shipped: 'Dikirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return <span className={`badge ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-6 skeleton h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Pesanan</h3>
                    <p className="text-gray-500 mb-6">Anda belum pernah membuat pesanan</p>
                    <Link to="/produk" className="btn-primary">Mulai Belanja</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{order.order_number}</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Clock className="w-4 h-4" />
                                {formatDate(order.created_at)}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    {order.items?.length || 0} produk
                                </span>
                                <span className="font-semibold text-gsm-orange">
                                    Rp {formatPrice(order.total_price + (order.shipping_cost || 0))}
                                </span>
                            </div>
                        </Link>
                    ))}

                    {meta.total_pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {[...Array(meta.total_pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-lg ${page === i + 1 ? 'bg-gsm-orange text-white' : 'bg-white border'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
