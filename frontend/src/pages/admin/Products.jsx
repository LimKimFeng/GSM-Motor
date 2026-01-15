import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, UserCheck } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '', category_id: '', price: '', price_3_items: '', price_5_items: '',
        stock: '', weight: '500', description: '', submitted_by: ''
    });
    const [images, setImages] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.products.list({ page, per_page: 20, search });
            setProducts(response.data.data || []);
            setMeta(response.data.meta || {});
        } catch (error) {
            toast.error('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, [page, search]);

    useEffect(() => {
        adminAPI.categories.list().then(res => setCategories(res.data.data || [])).catch(() => { });
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

    const openModal = (product = null) => {
        if (product) {
            setEditing(product);
            setForm({
                name: product.name, category_id: product.category_id,
                price: product.price, price_3_items: product.price_3_items || '',
                price_5_items: product.price_5_items || '', stock: product.stock,
                weight: product.weight, description: product.description || '',
                submitted_by: product.submitted_by || ''
            });
        } else {
            setEditing(null);
            setForm({ name: '', category_id: '', price: '', price_3_items: '', price_5_items: '', stock: '', weight: '500', description: '', submitted_by: '' });
        }
        setImages([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== '') formData.append(key, value);
        });
        images.forEach(img => formData.append('images', img));

        try {
            if (editing) {
                await adminAPI.products.update(editing.id, formData);
                toast.success('Produk diperbarui');
            } else {
                await adminAPI.products.create(formData);
                toast.success('Produk dibuat');
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menyimpan produk');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        try {
            await adminAPI.products.delete(id);
            toast.success('Produk dihapus');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal menghapus');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Produk</h1>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Produk
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 mb-4">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Produk</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Kategori</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Harga</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Stok</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Diupload oleh</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada produk</td></tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={p.image_path ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${p.image_path}` : '/placeholder.webp'}
                                                    alt="" className="w-10 h-10 object-cover rounded" />
                                                <span className="font-medium">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{p.category?.name || '-'}</td>
                                        <td className="px-4 py-3 font-medium">Rp {formatPrice(p.price)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${p.stock < 10 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.submitted_by ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                                    <UserCheck className="w-3 h-3" />
                                                    {p.submitted_by}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openModal(p)} className="p-2 hover:bg-gray-100 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-100 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori</label>
                                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field" required>
                                    <option value="">Pilih kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Harga</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Harga 3+</label>
                                    <input type="number" value={form.price_3_items} onChange={(e) => setForm({ ...form, price_3_items: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Harga 5+</label>
                                    <input type="number" value={form.price_5_items} onChange={(e) => setForm({ ...form, price_5_items: e.target.value })} className="input-field" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stok</label>
                                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Berat (gram)</label>
                                    <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" required />
                                </div>
                            </div>

                            {/* Submit By Input */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-blue-600">
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Submit by (Nama Pengupload)
                                </label>
                                <input
                                    type="text"
                                    value={form.submitted_by}
                                    onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
                                    className="input-field"
                                    placeholder="Masukkan nama Anda (case-sensitive)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    * Nama ini akan dicatat untuk tracking kinerja. Penulisan huruf besar/kecil dibedakan.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Gambar</label>
                                <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary w-full">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
