import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Search, Filter } from 'lucide-react';
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

    const getStatusStyles = (status) => {
        const styles = {
            pending: { bg: '#FEF3C7', color: '#92400E' },
            processing: { bg: '#DBEAFE', color: '#1E40AF' },
            shipped: { bg: '#E9D5FF', color: '#7C3AED' },
            completed: { bg: '#DCFCE7', color: '#166534' },
            cancelled: { bg: '#FEE2E2', color: '#991B1B' },
        };
        return styles[status] || { bg: '#F3F4F6', color: '#4B5563' };
    };

    const statusLabels = {
        pending: 'Menunggu',
        processing: 'Diproses',
        shipped: 'Dikirim',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
    };

    if (loading) {
        return (
            <div className="container py-8">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card skeleton" style={{ height: '128px' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                    Pesanan Saya
                </h1>
                <span
                    className="text-sm font-medium rounded-full"
                    style={{
                        padding: '0.375rem 1rem',
                        background: 'rgba(255, 107, 53, 0.1)',
                        color: 'var(--color-primary)'
                    }}
                >
                    {meta.total || 0} pesanan
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <div
                        className="mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{
                            width: '96px',
                            height: '96px',
                            background: 'var(--color-neutral-100)'
                        }}
                    >
                        <Package style={{ width: '48px', height: '48px', color: 'var(--color-neutral-300)' }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
                        Belum Ada Pesanan
                    </h3>
                    <p className="text-muted mb-6">Anda belum pernah membuat pesanan</p>
                    <Link to="/produk" className="btn btn-primary">
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map((order) => {
                        const statusStyle = getStatusStyles(order.status);
                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="card transition"
                                style={{ padding: '1.25rem' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="font-semibold"
                                            style={{ color: 'var(--color-neutral-800)' }}
                                        >
                                            {order.order_number}
                                        </span>
                                        <span
                                            className="badge"
                                            style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.color
                                            }}
                                        >
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <ChevronRight
                                        style={{ width: '20px', height: '20px', color: 'var(--color-neutral-400)' }}
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted mb-3">
                                    <Clock style={{ width: '14px', height: '14px' }} />
                                    {formatDate(order.created_at)}
                                </div>

                                <div
                                    className="flex items-center justify-between pt-3"
                                    style={{ borderTop: '1px solid var(--color-neutral-100)' }}
                                >
                                    <span className="text-sm text-muted">
                                        {order.items?.length || 0} produk
                                    </span>
                                    <span className="font-bold text-primary" style={{ fontSize: '1.125rem' }}>
                                        Rp {formatPrice(order.total_price + (order.shipping_cost || 0))}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Pagination */}
                    {meta.total_pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {[...Array(meta.total_pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className="rounded-xl font-medium transition"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: page === i + 1
                                            ? 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 100%)'
                                            : 'white',
                                        color: page === i + 1 ? 'white' : 'var(--color-neutral-600)',
                                        border: page === i + 1 ? 'none' : '1px solid var(--color-neutral-200)',
                                        boxShadow: page === i + 1 ? 'var(--shadow-primary)' : 'none'
                                    }}
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
