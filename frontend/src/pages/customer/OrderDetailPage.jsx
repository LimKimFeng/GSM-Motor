import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Package, Clock, MapPin, Truck, Upload, Check, X, CreditCard, MessageCircle } from 'lucide-react';
import { ordersAPI, checkoutAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const isNew = location.state?.isNew;
    const bankFromState = location.state?.bank;

    const [order, setOrder] = useState(null);
    const [bank, setBank] = useState(bankFromState);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.get(id);
                setOrder(response.data.order);
                if (!bank) setBank(response.data.bank);
            } catch (error) {
                toast.error('Gagal memuat pesanan');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, bank]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
            pending: 'Menunggu Pembayaran',
            processing: 'Sedang Diproses',
            shipped: 'Dalam Pengiriman',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return <span className={`badge ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    const getPaymentBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            uploaded: 'bg-blue-100 text-blue-800',
            verified: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        const labels = {
            pending: 'Belum Bayar',
            uploaded: 'Menunggu Verifikasi',
            verified: 'Terverifikasi',
            failed: 'Gagal',
        };
        return <span className={`badge ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    const handleUploadPayment = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            await checkoutAPI.uploadPayment(id, formData);
            toast.success('Bukti pembayaran berhasil diunggah');
            // Refresh order
            const response = await ordersAPI.get(id);
            setOrder(response.data.order);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal mengunggah bukti pembayaran');
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (path) => {
        return path
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/uploads/${path}`
            : '/placeholder.webp';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="bg-white rounded-xl p-6 skeleton h-40" />
                    <div className="bg-white rounded-xl p-6 skeleton h-60" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-xl font-bold">Pesanan tidak ditemukan</h2>
                <Link to="/orders" className="btn-primary mt-4">Kembali</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Success Banner for New Order */}
                {isNew && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-800">Pesanan Berhasil Dibuat!</p>
                            <p className="text-sm text-green-600">Silakan transfer sesuai nominal di bawah</p>
                        </div>
                    </div>
                )}

                {/* Order Header */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Nomor Pesanan</p>
                            <p className="font-bold text-lg">{order.order_number}</p>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.created_at)}
                    </div>
                </div>

                {/* Payment Section */}
                {order.payment_status !== 'verified' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-yellow-700" />
                            <h3 className="font-semibold text-yellow-800">Pembayaran</h3>
                            {getPaymentBadge(order.payment_status)}
                        </div>

                        {bank && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-500">Transfer ke:</p>
                                <p className="font-medium">{bank.name}</p>
                                <p className="text-xl font-bold text-gray-800">{bank.number}</p>
                                <p className="text-sm text-gray-500">a.n. {bank.account}</p>
                                <hr className="my-3" />
                                <div className="flex justify-between">
                                    <span>Total Transfer:</span>
                                    <span className="font-bold text-gsm-orange text-lg">
                                        Rp {formatPrice(order.total_price + (order.shipping_cost || 0))}
                                    </span>
                                </div>
                            </div>
                        )}

                        {order.payment_status === 'pending' && (
                            <label className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer">
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Upload Bukti Transfer
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadPayment}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        )}

                        {order.payment_status === 'uploaded' && (
                            <p className="text-center text-yellow-700">Menunggu verifikasi admin...</p>
                        )}
                    </div>
                )}

                {/* Shipping */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-800">Pengiriman</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Metode</span>
                            <span className="capitalize">{order.shipping_method?.replace('_', ' ')}</span>
                        </div>
                        {order.courier && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Kurir</span>
                                <span className="uppercase">{order.courier} {order.courier_service}</span>
                            </div>
                        )}
                        {order.tracking_number && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">No. Resi</span>
                                <span className="font-medium">{order.tracking_number}</span>
                            </div>
                        )}
                    </div>

                    {order.shipping_address && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600">{order.shipping_address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-4">Produk</h3>
                    <div className="space-y-3">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <img
                                    src={getImageUrl(item.product?.image_path)}
                                    alt={item.product?.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{item.product?.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} x Rp {formatPrice(item.price_at_purchase)}</p>
                                </div>
                                <p className="font-semibold">Rp {formatPrice(item.quantity * item.price_at_purchase)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp {formatPrice(order.total_price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ongkos Kirim</span>
                            <span>Rp {formatPrice(order.shipping_cost || 0)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-gsm-orange">
                                Rp {formatPrice(order.total_price + (order.shipping_cost || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link to="/orders" className="btn-secondary flex-1 text-center">
                        Kembali
                    </Link>
                    <a
                        href={`https://wa.me/6281386363979?text=Halo, saya mau tanya pesanan *${order.order_number}*`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Hubungi
                    </a>
                </div>
            </div>
        </div>
    );
}
