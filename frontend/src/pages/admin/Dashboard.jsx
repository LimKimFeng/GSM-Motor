import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await adminAPI.dashboard();
                setStats(response.data.stats);
                setRecentOrders(response.data.recent_orders || []);
                setLowStock(response.data.low_stock_products || []);
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-xl p-6 skeleton h-24" />)}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total_orders || 0}</p>
                            <p className="text-sm text-gray-500">Total Pesanan</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">Rp {formatPrice(stats?.total_revenue || 0)}</p>
                            <p className="text-sm text-gray-500">Total Pendapatan</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total_products || 0}</p>
                            <p className="text-sm text-gray-500">Total Produk</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total_customers || 0}</p>
                            <p className="text-sm text-gray-500">Total Customer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-700 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Menunggu Pembayaran</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-800">{stats?.pending_payments || 0}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">Perlu Diproses</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">{stats?.pending_orders || 0}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Stok Menipis</span>
                    </div>
                    <p className="text-2xl font-bold text-red-800">{stats?.low_stock_products || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Pesanan Terbaru</h2>
                        <Link to="/admin/orders" className="text-sm text-gsm-orange hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-sm">Belum ada pesanan</p>
                        ) : (
                            recentOrders.slice(0, 5).map((order) => (
                                <Link
                                    key={order.id}
                                    to={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{order.order_number}</p>
                                        <p className="text-xs text-gray-500">{order.user?.name}</p>
                                    </div>
                                    <span className={`badge ${order.status === 'pending' ? 'badge-warning' :
                                            order.status === 'processing' ? 'badge-info' :
                                                order.status === 'completed' ? 'badge-success' : 'bg-gray-100'
                                        }`}>
                                        {order.status}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="bg-white rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Stok Menipis</h2>
                        <Link to="/admin/products" className="text-sm text-gsm-orange hover:underline">Kelola Produk</Link>
                    </div>
                    <div className="space-y-3">
                        {lowStock.length === 0 ? (
                            <p className="text-gray-500 text-sm">Semua stok aman</p>
                        ) : (
                            lowStock.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category?.name}</p>
                                    </div>
                                    <span className={`badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                        {product.stock} pcs
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
