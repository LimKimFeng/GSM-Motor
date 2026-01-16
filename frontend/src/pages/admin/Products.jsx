import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, UserCheck, ArrowLeft } from 'lucide-react';
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
            {!showModal && (
                <>
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
                                                        <div style={{ width: '100px', height: '100px' }} className="shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                                            <img
                                                                src={p.image_path ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${p.image_path}` : '/placeholder.webp'}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
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
                </>
            )}

            {/* Form View */}
            {showModal && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                            {editing ? 'Edit Produk' : 'Tambah Produk'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Image Upload Section - TOP */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-dashed border-orange-300">
                            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
                                📸 Gambar Produk
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setImages([...e.target.files])}
                                className="input-field"
                                id="image-upload"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                                Upload hingga 5 gambar. Format: JPG, PNG, GIF, WebP. Otomatis dikonversi ke WebP &lt;500KB
                            </p>

                            {/* Image Preview */}
                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {Array.from(images).map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border-2 border-orange-200"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(Array.from(images).filter((_, i) => i !== idx))}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details - 2 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Nama Produk *
                                </label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Contoh: Aki Motor Yuasa 12V" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Kategori *
                                </label>
                                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field" required>
                                    <option value="">Pilih kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Stok *
                                </label>
                                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="100" required />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-neutral-800)' }}>💰 Harga</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Harga Normal *</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="50000" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Harga 3+ items</label>
                                    <input type="number" value={form.price_3_items} onChange={(e) => setForm({ ...form, price_3_items: e.target.value })} className="input-field" placeholder="45000" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Harga 5+ items</label>
                                    <input type="number" value={form.price_5_items} onChange={(e) => setForm({ ...form, price_5_items: e.target.value })} className="input-field" placeholder="40000" />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Berat (gram) *
                                </label>
                                <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" placeholder="500" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-blue-600">
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Diupload oleh
                                </label>
                                <input
                                    type="text"
                                    value={form.submitted_by}
                                    onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
                                    className="input-field"
                                    placeholder="Nama Anda"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                Deskripsi
                            </label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Deskripsi produk..." />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                                Batal
                            </button>
                            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                                {saving ? 'Menyimpan...' : (editing ? 'Update Produk' : 'Tambah Produk')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
