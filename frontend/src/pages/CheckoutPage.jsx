import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Store, MessageCircle, CreditCard, AlertCircle } from 'lucide-react';
import { checkoutAPI, shippingAPI, profileAPI } from '../services/api';
import { useCartStore, useAuthStore } from '../context/store';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const { subtotal, totalWeight, fetchCart, clearCart } = useCartStore();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('pickup');
    const [courier, setCourier] = useState('');
    const [courierService, setCourierService] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [courierOptions, setCourierOptions] = useState([]);
    const [loadingCourier, setLoadingCourier] = useState(false);
    const [notes, setNotes] = useState('');

    // Address edit
    const [editingAddress, setEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({});
    const [destinations, setDestinations] = useState([]);
    const [searchingDest, setSearchingDest] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await checkoutAPI.prepare();
                setCheckoutData(response.data);
                setAddressForm({
                    address_detail: response.data.user?.address_detail || '',
                    subdistrict_id: response.data.user?.subdistrict_id || '',
                });

                if (!response.data.has_address) {
                    setEditingAddress(true);
                }
            } catch (error) {
                toast.error('Gagal memuat data checkout');
                navigate('/keranjang');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchCart();
    }, [navigate, fetchCart]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

    const handleShippingMethodChange = async (method) => {
        setShippingMethod(method);
        setCourier('');
        setCourierService('');
        setShippingCost(0);
        setCourierOptions([]);

        if (method === 'courier' && checkoutData?.user?.subdistrict_id) {
            await fetchCourierOptions();
        }
    };

    const fetchCourierOptions = async () => {
        if (!checkoutData?.user?.subdistrict_id) {
            toast.error('Silakan lengkapi alamat terlebih dahulu');
            return;
        }

        setLoadingCourier(true);
        try {
            const response = await shippingAPI.calculateCost({
                destination_subdistrict_id: checkoutData.user.subdistrict_id,
                weight: totalWeight || 500,
            });
            setCourierOptions(response.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat opsi kurir');
        } finally {
            setLoadingCourier(false);
        }
    };

    const handleCourierSelect = (courierCode, service, cost) => {
        setCourier(courierCode);
        setCourierService(service);
        setShippingCost(cost);
    };

    const searchDestinations = async (query) => {
        if (query.length < 3) return;

        setSearchingDest(true);
        try {
            const response = await shippingAPI.searchDestinations(query);
            setDestinations(response.data.data || []);
        } catch (error) {
            console.error('Error searching destinations:', error);
        } finally {
            setSearchingDest(false);
        }
    };

    const handleDestinationSelect = async (dest) => {
        const addressData = {
            province: dest.province,
            province_id: dest.province_id,
            city: dest.city_name,
            city_id: dest.city_id,
            subdistrict: dest.subdistrict_name,
            subdistrict_id: dest.subdistrict_id,
            postal_code: dest.zip_code,
            address_detail: addressForm.address_detail,
        };

        try {
            await profileAPI.updateAddress(addressData);
            updateUser(addressData);
            setCheckoutData(prev => ({
                ...prev,
                user: { ...prev.user, ...addressData },
                has_address: true,
            }));
            setEditingAddress(false);
            setDestinations([]);
            toast.success('Alamat diperbarui');
        } catch (error) {
            toast.error('Gagal menyimpan alamat');
        }
    };

    const handleSubmit = async () => {
        if (shippingMethod === 'courier' && !courier) {
            toast.error('Silakan pilih kurir pengiriman');
            return;
        }

        if (shippingMethod === 'courier' && !checkoutData?.has_address) {
            toast.error('Silakan lengkapi alamat terlebih dahulu');
            return;
        }

        setSubmitting(true);
        try {
            const response = await checkoutAPI.process({
                shipping_method: shippingMethod,
                courier,
                courier_service: courierService,
                shipping_cost: shippingCost,
                notes,
            });

            await clearCart();
            toast.success('Pesanan berhasil dibuat!');
            navigate(`/orders/${response.data.order_id}`, {
                state: {
                    isNew: true,
                    bank: response.data.bank,
                    orderNumber: response.data.order_number,
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal membuat pesanan');
        } finally {
            setSubmitting(false);
        }
    };

    const grandTotal = subtotal + shippingCost;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="h-8 skeleton w-1/3 mb-6" />
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-6 skeleton h-40" />
                        <div className="bg-white rounded-xl p-6 skeleton h-60" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

                {/* Address */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gsm-orange" />
                            <h2 className="font-semibold text-gray-800">Alamat Pengiriman</h2>
                        </div>
                        {!editingAddress && (
                            <button
                                onClick={() => setEditingAddress(true)}
                                className="text-sm text-gsm-orange hover:underline"
                            >
                                Ubah
                            </button>
                        )}
                    </div>

                    {editingAddress ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cari Kecamatan/Kelurahan
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ketik nama kecamatan..."
                                    onChange={(e) => searchDestinations(e.target.value)}
                                    className="input-field"
                                />

                                {searchingDest && (
                                    <p className="text-sm text-gray-500 mt-2">Mencari...</p>
                                )}

                                {destinations.length > 0 && (
                                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                                        {destinations.map((dest, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleDestinationSelect(dest)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                            >
                                                {dest.subdistrict_name}, {dest.city_name}, {dest.province}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    value={addressForm.address_detail}
                                    onChange={(e) => setAddressForm({ ...addressForm, address_detail: e.target.value })}
                                    placeholder="Nama jalan, nomor rumah, RT/RW..."
                                    className="input-field"
                                    rows={3}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-gray-600">{user?.phone}</p>
                            <p className="text-gray-600 mt-1">
                                {checkoutData?.user?.address_detail}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {checkoutData?.user?.subdistrict}, {checkoutData?.user?.city}, {checkoutData?.user?.province}
                            </p>
                        </div>
                    )}
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-gsm-orange" />
                        <h2 className="font-semibold text-gray-800">Metode Pengiriman</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Pickup */}
                        <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'pickup' ? 'border-gsm-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="shipping"
                                checked={shippingMethod === 'pickup'}
                                onChange={() => handleShippingMethodChange('pickup')}
                                className="text-gsm-orange focus:ring-gsm-orange"
                            />
                            <Store className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="font-medium">Ambil di Tempat</p>
                                <p className="text-sm text-gray-500">Ambil pesanan langsung di toko</p>
                            </div>
                            <span className="text-green-600 font-medium">Gratis</span>
                        </label>

                        {/* Ojol */}
                        <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'ojol' ? 'border-gsm-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="shipping"
                                checked={shippingMethod === 'ojol'}
                                onChange={() => handleShippingMethodChange('ojol')}
                                className="text-gsm-orange focus:ring-gsm-orange"
                            />
                            <MessageCircle className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="font-medium">Grab/Gojek/InDriver</p>
                                <p className="text-sm text-gray-500">Biaya diatur via WhatsApp</p>
                            </div>
                        </label>

                        {/* Courier */}
                        <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'courier' ? 'border-gsm-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input
                                type="radio"
                                name="shipping"
                                checked={shippingMethod === 'courier'}
                                onChange={() => handleShippingMethodChange('courier')}
                                className="text-gsm-orange focus:ring-gsm-orange"
                            />
                            <Truck className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <p className="font-medium">Kurir (JNE/J&T)</p>
                                <p className="text-sm text-gray-500">Pengiriman via ekspedisi</p>
                            </div>
                        </label>
                    </div>

                    {/* Courier Options */}
                    {shippingMethod === 'courier' && (
                        <div className="mt-4 border-t pt-4">
                            {loadingCourier ? (
                                <p className="text-gray-500">Memuat opsi kurir...</p>
                            ) : courierOptions.length > 0 ? (
                                <div className="space-y-2">
                                    {courierOptions.map((opt) =>
                                        opt.costs?.map((cost) => (
                                            <label
                                                key={`${opt.code}-${cost.service}`}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${courier === opt.code && courierService === cost.service ? 'border-gsm-orange bg-orange-50' : 'border-gray-200'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="courier"
                                                        checked={courier === opt.code && courierService === cost.service}
                                                        onChange={() => handleCourierSelect(opt.code, cost.service, cost.cost?.[0]?.value || 0)}
                                                        className="text-gsm-orange"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{opt.name} {cost.service}</p>
                                                        <p className="text-xs text-gray-500">{cost.description} ({cost.cost?.[0]?.etd || '-'} hari)</p>
                                                    </div>
                                                </div>
                                                <span className="font-semibold">Rp {formatPrice(cost.cost?.[0]?.value || 0)}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <p>Lengkapi alamat untuk melihat opsi kurir</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl p-6 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Catatan untuk pesanan..."
                        className="input-field"
                        rows={2}
                    />
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Informasi Pembayaran</h3>
                    </div>
                    <p className="text-blue-700 text-sm mb-2">
                        Transfer ke rekening berikut setelah checkout:
                    </p>
                    <div className="bg-white rounded-lg p-3">
                        <p className="font-medium">{checkoutData?.bank?.name}</p>
                        <p className="text-lg font-bold text-gray-800">{checkoutData?.bank?.number}</p>
                        <p className="text-sm text-gray-500">a.n. {checkoutData?.bank?.account}</p>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Pembayaran</h3>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal Produk</span>
                            <span>Rp {formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ongkos Kirim</span>
                            <span>{shippingMethod === 'ojol' ? 'Via WhatsApp' : `Rp ${formatPrice(shippingCost)}`}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-gsm-orange">Rp {formatPrice(grandTotal)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Buat Pesanan'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
