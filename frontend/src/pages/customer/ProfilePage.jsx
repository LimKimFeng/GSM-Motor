import { useState } from 'react';
import { useAuthStore } from '../../context/store';
import { profileAPI, shippingAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [searchingDest, setSearchingDest] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address_detail: user?.address_detail || '',
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await profileAPI.update({ name: form.name, phone: form.phone });
            updateUser({ name: form.name, phone: form.phone });
            toast.success('Profil berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    const searchDestinations = async (query) => {
        if (query.length < 3) return;
        setSearchingDest(true);
        try {
            const response = await shippingAPI.searchDestinations(query);
            setDestinations(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
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
            address_detail: form.address_detail,
        };

        setLoading(true);
        try {
            await profileAPI.updateAddress(addressData);
            updateUser(addressData);
            setDestinations([]);
            toast.success('Alamat diperbarui');
        } catch (error) {
            toast.error('Gagal menyimpan alamat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Profil</h1>

            <div className="max-w-xl">
                {/* Profile Info */}
                <div className="bg-white rounded-xl p-6 mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Informasi Akun</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email}
                                className="input-field bg-gray-50"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="input-field"
                                placeholder="08123456789"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </form>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl p-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Alamat Pengiriman</h2>

                    {user?.subdistrict && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="font-medium">{user.subdistrict}</p>
                            <p className="text-sm text-gray-600">{user.city}, {user.province}</p>
                            {user.address_detail && <p className="text-sm text-gray-500 mt-1">{user.address_detail}</p>}
                        </div>
                    )}

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

                            {searchingDest && <p className="text-sm text-gray-500 mt-2">Mencari...</p>}

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
                                value={form.address_detail}
                                onChange={(e) => setForm({ ...form, address_detail: e.target.value })}
                                placeholder="Nama jalan, nomor rumah, RT/RW..."
                                className="input-field"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
