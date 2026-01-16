import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const openForm = (cat = null) => {
        setEditing(cat);
        setName(cat?.name || '');
    };

    const clearForm = () => {
        setEditing(null);
        setName('');
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
            clearForm();
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Category List (2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
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
                                        <tr
                                            key={cat.id}
                                            className={`hover:bg-gray-50 transition ${editing?.id === cat.id ? 'bg-orange-50' : ''}`}
                                        >
                                            <td className="px-4 py-3 font-medium">{cat.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => openForm(cat)}
                                                        className="p-2 hover:bg-gray-100 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 hover:bg-red-100 text-red-500 rounded transition"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Side: Add/Edit Form (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
                            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                                <Plus className="w-5 h-5" />
                                {editing ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                            <p className="text-xs text-gray-600 mt-1">
                                {editing ? 'Ubah nama kategori di bawah' : 'Buat kategori baru untuk produk'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving || !name.trim()}
                                    className="btn btn-primary w-full"
                                >
                                    {saving ? 'Menyimpan...' : (editing ? 'Update Kategori' : 'Tambah Kategori')}
                                </button>

                                {editing && (
                                    <button
                                        type="button"
                                        onClick={clearForm}
                                        className="btn btn-secondary w-full"
                                    >
                                        Batal Edit
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Info Panel */}
                        <div className="px-6 pb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    💡 <strong>Tips:</strong> Klik tombol Edit pada tabel untuk mengubah kategori yang sudah ada.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
