import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Banners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchBanners = async () => {
        try {
            const response = await adminAPI.banners.list();
            setBanners(response.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat banner');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${path}`;

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('is_active', 'true');

        setUploading(true);
        try {
            await adminAPI.banners.create(formData);
            toast.success('Banner ditambahkan');
            fetchBanners();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal mengunggah');
        } finally {
            setUploading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.banners.toggle(id);
            fetchBanners();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus banner ini?')) return;
        try {
            await adminAPI.banners.delete(id);
            toast.success('Banner dihapus');
            fetchBanners();
        } catch (error) {
            toast.error('Gagal menghapus');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Banner</h1>
                <label className="btn-primary flex items-center gap-2 cursor-pointer">
                    {uploading ? 'Mengunggah...' : <><Plus className="w-4 h-4" /> Tambah Banner</>}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500">Memuat...</div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500">Tidak ada banner</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-xl overflow-hidden">
                            <div className="relative aspect-[3/1]">
                                <img src={getImageUrl(banner.image_path)} alt="" className="w-full h-full object-cover" />
                                {!banner.is_active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold">Tidak Aktif</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className={`badge ${banner.is_active ? 'badge-success' : 'bg-gray-100'}`}>
                                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleToggle(banner.id)} className="p-2 hover:bg-gray-100 rounded">
                                        {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(banner.id)} className="p-2 hover:bg-red-100 text-red-500 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
