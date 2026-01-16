import { useState } from 'react';
import { useAuthStore } from '../../context/store';
import { profileAPI, shippingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { User, MapPin, Phone, Mail, Search, Check } from 'lucide-react';

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
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-neutral-800)' }}>
                Pengaturan Profil
            </h1>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info Card - Left Column */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="flex items-center justify-center rounded-xl"
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'rgba(255, 107, 53, 0.1)'
                            }}
                        >
                            <User style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                            <h2 className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                                Informasi Akun
                            </h2>
                            <p className="text-sm text-muted">Data pribadi Anda</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-neutral-700)' }}
                            >
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-neutral-700)' }}
                            >
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={user?.email}
                                    className="input-field input-with-icon"
                                    style={{
                                        background: 'var(--color-neutral-100)',
                                        color: 'var(--color-neutral-500)',
                                        cursor: 'not-allowed'
                                    }}
                                    disabled
                                />
                                <Mail className="input-icon" />
                            </div>
                            <p className="text-xs text-muted mt-1">Email tidak dapat diubah</p>
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-neutral-700)' }}
                            >
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input-field input-with-icon"
                                    placeholder="08123456789"
                                />
                                <Phone className="input-icon" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                marginTop: '0.5rem',
                                opacity: loading ? 0.5 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <div className="spinner-sm" style={{ borderTopColor: 'white' }}></div>
                            ) : (
                                <>
                                    <Check style={{ width: '16px', height: '16px' }} />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Address Card */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="flex items-center justify-center rounded-xl"
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'rgba(16, 185, 129, 0.1)'
                            }}
                        >
                            <MapPin style={{ width: '20px', height: '20px', color: 'var(--color-success)' }} />
                        </div>
                        <div>
                            <h2 className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                                Alamat Pengiriman
                            </h2>
                            <p className="text-sm text-muted">Alamat untuk pengiriman pesanan</p>
                        </div>
                    </div>

                    {/* Current Address */}
                    {user?.subdistrict && (
                        <div
                            className="rounded-xl mb-6"
                            style={{
                                padding: '1rem',
                                background: 'var(--color-neutral-50)',
                                border: '1px solid var(--color-neutral-100)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="rounded-full flex items-center justify-center"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        background: 'var(--color-success)'
                                    }}
                                >
                                    <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                                </div>
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                                    Alamat Tersimpan
                                </span>
                            </div>
                            <p className="font-medium" style={{ color: 'var(--color-neutral-800)' }}>
                                {user.subdistrict}
                            </p>
                            <p className="text-sm text-muted">
                                {user.city}, {user.province}
                            </p>
                            {user.address_detail && (
                                <p className="text-sm text-muted mt-1">{user.address_detail}</p>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Search Destination */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-neutral-700)' }}
                            >
                                Cari Kecamatan/Kelurahan
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ketik nama kecamatan..."
                                    onChange={(e) => searchDestinations(e.target.value)}
                                    className="input-field input-with-icon"
                                />
                                <Search className="input-icon" />
                            </div>

                            {searchingDest && (
                                <p className="text-sm text-muted mt-2 flex items-center gap-2">
                                    <div className="spinner-sm"></div>
                                    Mencari...
                                </p>
                            )}

                            {destinations.length > 0 && (
                                <div
                                    className="rounded-xl mt-2 overflow-hidden"
                                    style={{
                                        border: '1px solid var(--color-neutral-200)',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}
                                >
                                    {destinations.map((dest, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleDestinationSelect(dest)}
                                            className="w-full text-left text-sm transition"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: 'white',
                                                border: 'none',
                                                borderBottom: i < destinations.length - 1 ? '1px solid var(--color-neutral-100)' : 'none',
                                                color: 'var(--color-neutral-700)'
                                            }}
                                        >
                                            <span className="font-medium">{dest.subdistrict_name}</span>
                                            <span className="text-muted"> - {dest.city_name}, {dest.province}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Address Detail */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-neutral-700)' }}
                            >
                                Alamat Lengkap
                            </label>
                            <textarea
                                value={form.address_detail}
                                onChange={(e) => setForm({ ...form, address_detail: e.target.value })}
                                placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                className="input-field"
                                style={{ resize: 'vertical', minHeight: '100px' }}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
