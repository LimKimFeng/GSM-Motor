import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Truck, MapPin, CreditCard, Package, Printer } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await adminAPI.orders.get(id);
                setOrder(response.data.order);
                setTrackingNumber(response.data.order?.tracking_number || '');
            } catch (error) {
                toast.error('Gagal memuat pesanan');
                navigate('/admin/orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const updateStatus = async (status) => {
        setUpdating(true);
        try {
            await adminAPI.orders.updateStatus(id, { status, tracking_number: trackingNumber });
            setOrder({ ...order, status, tracking_number: trackingNumber });
            toast.success('Status diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui status');
        } finally {
            setUpdating(false);
        }
    };

    const verifyPayment = async (proofId, status) => {
        try {
            await adminAPI.orders.verifyPayment(id, proofId, { status });
            toast.success(status === 'verified' ? 'Pembayaran diverifikasi' : 'Pembayaran ditolak');
            // Refresh
            const response = await adminAPI.orders.get(id);
            setOrder(response.data.order);
        } catch (error) {
            toast.error('Gagal memverifikasi');
        }
    };

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${path}`;

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gsm-orange border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (!order) return null;

    return (
        <div>
            <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{order.order_number}</h1>
                    <p className="text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <span className={`badge text-lg px-4 py-2 ${order.status === 'pending' ? 'badge-warning' :
                        order.status === 'processing' ? 'badge-info' :
                            order.status === 'completed' ? 'badge-success' : 'bg-gray-100'
                    }`}>{order.status}</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Produk</h2>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <img src={getImageUrl(item.product?.image_path)} alt="" className="w-14 h-14 object-cover rounded" />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x Rp {formatPrice(item.price_at_purchase)}</p>
                                    </div>
                                    <p className="font-semibold">Rp {formatPrice(item.quantity * item.price_at_purchase)}</p>
                                </div>
                            ))}
                        </div>
                        <hr className="my-4" />
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rp {formatPrice(order.total_price)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Ongkir</span><span>Rp {formatPrice(order.shipping_cost || 0)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-gsm-orange">Rp {formatPrice(order.total_price + (order.shipping_cost || 0))}</span></div>
                        </div>
                    </div>

                    {/* Payment Proofs */}
                    {order.payment_proofs?.length > 0 && (
                        <div className="bg-white rounded-xl p-6">
                            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Bukti Pembayaran</h2>
                            <div className="space-y-3">
                                {order.payment_proofs.map((proof) => (
                                    <div key={proof.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <img src={getImageUrl(proof.image_path)} alt="Bukti" className="w-20 h-20 object-cover rounded cursor-pointer" onClick={() => window.open(getImageUrl(proof.image_path))} />
                                        <div className="flex-1">
                                            <span className={`badge ${proof.status === 'verified' ? 'badge-success' : proof.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{proof.status}</span>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(proof.created_at)}</p>
                                        </div>
                                        {proof.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => verifyPayment(proof.id, 'verified')} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => verifyPayment(proof.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><X className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl p-6">
                        <h2 className="font-semibold text-gray-800 mb-3">Customer</h2>
                        <p className="font-medium">{order.user?.name}</p>
                        <p className="text-gray-500 text-sm">{order.user?.email}</p>
                        <p className="text-gray-500 text-sm">{order.user?.phone}</p>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white rounded-xl p-6">
                        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Truck className="w-5 h-5" /> Pengiriman</h2>
                        <p className="capitalize">{order.shipping_method?.replace('_', ' ')}</p>
                        {order.courier && <p className="text-gray-500 text-sm uppercase">{order.courier} {order.courier_service}</p>}
                        {order.shipping_address && (
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm text-gray-600">{order.shipping_address}</p></div>
                            </div>
                        )}

                        {order.shipping_method === 'courier' && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-1">No. Resi</label>
                                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-field" placeholder="Masukkan resi" />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl p-6">
                        <h2 className="font-semibold text-gray-800 mb-3">Aksi</h2>
                        <div className="space-y-2">
                            {order.status === 'pending' && order.payment_status === 'verified' && (
                                <button onClick={() => updateStatus('processing')} disabled={updating} className="btn-primary w-full">Proses Pesanan</button>
                            )}
                            {order.status === 'processing' && (
                                <button onClick={() => updateStatus('shipped')} disabled={updating} className="btn-primary w-full">Tandai Dikirim</button>
                            )}
                            {order.status === 'shipped' && (
                                <button onClick={() => updateStatus('completed')} disabled={updating} className="btn-primary w-full">Selesai</button>
                            )}
                            {order.status === 'pending' && (
                                <button onClick={() => updateStatus('cancelled')} disabled={updating} className="btn-secondary w-full text-red-500">Batalkan</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
