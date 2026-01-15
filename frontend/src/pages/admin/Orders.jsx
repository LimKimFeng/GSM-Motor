import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Check, X } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.orders.list({ page, per_page: 20, search, status });
            setOrders(response.data.data || []);
            setMeta(response.data.meta || {});
        } catch (error) {
            toast.error('Gagal memuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [page, search, status]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const getStatusBadge = (s) => {
        const styles = { pending: 'badge-warning', processing: 'badge-info', shipped: 'bg-purple-100 text-purple-800', completed: 'badge-success', cancelled: 'badge-danger' };
        return <span className={`badge ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
    };

    const getPaymentBadge = (s) => {
        const styles = { pending: 'badge-warning', uploaded: 'badge-info', verified: 'badge-success', failed: 'badge-danger' };
        return <span className={`badge ${styles[s] || 'bg-gray-100'}`}>{s}</span>;
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 mb-4 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <input type="text" placeholder="Cari nomor pesanan..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto">
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">No. Pesanan</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Customer</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Pembayaran</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Tanggal</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada pesanan</td></tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{o.order_number}</td>
                                        <td className="px-4 py-3 text-gray-600">{o.user?.name || '-'}</td>
                                        <td className="px-4 py-3 font-medium">Rp {formatPrice(o.total_price + (o.shipping_cost || 0))}</td>
                                        <td className="px-4 py-3">{getStatusBadge(o.status)}</td>
                                        <td className="px-4 py-3">{getPaymentBadge(o.payment_status)}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(o.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <Link to={`/admin/orders/${o.id}`} className="p-2 hover:bg-gray-100 rounded inline-flex"><Eye className="w-4 h-4" /></Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {meta.total_pages > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t">
                        {[...Array(Math.min(meta.total_pages, 5))].map((_, i) => (
                            <button key={i + 1} onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 rounded ${page === i + 1 ? 'bg-gsm-orange text-white' : 'bg-gray-100'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
