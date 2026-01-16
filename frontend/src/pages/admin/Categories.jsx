import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await adminAPI.categories.list();
            setCategories(response.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openModal = (cat = null) => {
        setEditing(cat);
        setName(cat?.name || '');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await adminAPI.categories.update(editing.id, { name });
                toast.success('Kategori diperbarui');
            } else {
                await adminAPI.categories.create({ name });
                toast.success('Kategori dibuat');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kategori ini?')) return;
        try {
            await adminAPI.categories.delete(id);
            toast.success('Kategori dihapus');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menghapus');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Kategori</h1>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah
                </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuat...</div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Tidak ada kategori</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Nama</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Slug</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => openModal(cat)} className="p-2 hover:bg-gray-100 rounded"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-100 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                                {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Nama Kategori *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="Contoh: Aki & Baterai"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Slug akan dibuat otomatis dari nama kategori
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                                    {saving ? 'Menyimpan...' : (editing ? 'Update Kategori' : 'Tambah Kategori')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
