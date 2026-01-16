import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { slug: categorySlug } = useParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, total_pages: 1, current_page: 1 });
    const [showFilters, setShowFilters] = useState(false);

    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { page, per_page: 20, sort, search };

                let response;
                if (categorySlug) {
                    response = await productsAPI.byCategory(categorySlug, params);
                    setCategory(response.data.category);
                    setProducts(response.data.products || []);
                    setMeta(response.data.meta || {});
                } else {
                    response = await productsAPI.list(params);
                    setProducts(response.data.data || []);
                    setMeta(response.data.meta || {});
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, search, sort, page]);

    useEffect(() => {
        productsAPI.categories().then(res => setCategories(res.data.data || [])).catch(() => { });
    }, []);

    const updateParams = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        if (key !== 'page') newParams.delete('page');
        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-neutral-50)' }}>
            {/* Header */}
            <div
                className="sticky bg-white border-b"
                style={{
                    top: '0',
                    zIndex: 40,
                    borderColor: 'var(--color-neutral-100)'
                }}
            >
                <div className="container py-5">
                    <div className="flex flex-col md:flex items-center justify-between gap-4" style={{ flexDirection: 'row' }}>
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>
                                {category ? category.name : search ? `Hasil: "${search}"` : 'Semua Produk'}
                            </h1>
                            <p className="text-sm text-muted mt-1">
                                {meta.total || 0} produk ditemukan
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1" style={{ minWidth: '200px', maxWidth: '288px' }}>
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => updateParams('search', e.target.value)}
                                    className="input-field input-with-icon"
                                    style={{ paddingRight: '1rem' }}
                                />
                                <Search className="input-icon" />
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={(e) => updateParams('sort', e.target.value)}
                                    className="rounded-xl text-sm cursor-pointer transition"
                                    style={{
                                        appearance: 'none',
                                        padding: '0.625rem 2.5rem 0.625rem 1rem',
                                        background: 'white',
                                        border: '1px solid var(--color-neutral-200)',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="price_asc">Harga: Rendah → Tinggi</option>
                                    <option value="price_desc">Harga: Tinggi → Rendah</option>
                                    <option value="name">Nama A-Z</option>
                                </select>
                                <ChevronDown
                                    className="pointer-events-none"
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '16px',
                                        height: '16px',
                                        color: 'var(--color-neutral-400)'
                                    }}
                                />
                            </div>

                            {/* Filter Toggle (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden rounded-xl transition"
                                style={{
                                    padding: '0.625rem',
                                    background: showFilters ? 'var(--color-primary)' : 'white',
                                    border: `1px solid ${showFilters ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
                                    color: showFilters ? 'white' : 'var(--color-neutral-600)'
                                }}
                            >
                                <SlidersHorizontal style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(search || categorySlug) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {search && (
                                <span
                                    className="inline-flex items-center gap-2 rounded-lg text-sm font-medium"
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        background: 'rgba(255, 107, 53, 0.1)',
                                        color: 'var(--color-primary)'
                                    }}
                                >
                                    Pencarian: {search}
                                    <button
                                        onClick={() => updateParams('search', '')}
                                        className="rounded-full transition"
                                        style={{ padding: '0.125rem' }}
                                    >
                                        <X style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </span>
                            )}
                            {categorySlug && (
                                <span
                                    className="inline-flex items-center gap-2 rounded-lg text-sm font-medium"
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        background: 'rgba(255, 107, 53, 0.1)',
                                        color: 'var(--color-primary)'
                                    }}
                                >
                                    Kategori: {category?.name}
                                    <Link to="/produk" className="rounded-full transition" style={{ padding: '0.125rem' }}>
                                        <X style={{ width: '14px', height: '14px' }} />
                                    </Link>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="container py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} md:block shrink-0`} style={{ width: '256px' }}>
                        <div
                            className="card p-5 sticky"
                            style={{ top: '180px' }}
                        >
                            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-neutral-800)' }}>
                                <LayoutGrid style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                Kategori
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <Link
                                    to="/produk"
                                    className="rounded-xl text-sm font-medium transition"
                                    style={{
                                        padding: '0.625rem 1rem',
                                        background: !categorySlug ? 'var(--color-primary)' : 'transparent',
                                        color: !categorySlug ? 'white' : 'var(--color-neutral-600)',
                                        boxShadow: !categorySlug ? 'var(--shadow-primary)' : 'none'
                                    }}
                                >
                                    Semua Produk
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/kategori/${cat.slug}`}
                                        className="rounded-xl text-sm font-medium transition"
                                        style={{
                                            padding: '0.625rem 1rem',
                                            background: categorySlug === cat.slug ? 'var(--color-primary)' : 'transparent',
                                            color: categorySlug === cat.slug ? 'white' : 'var(--color-neutral-600)',
                                            boxShadow: categorySlug === cat.slug ? 'var(--shadow-primary)' : 'none'
                                        }}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="products-grid">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="card rounded-2xl overflow-hidden">
                                        <div className="aspect-square skeleton" />
                                        <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div className="skeleton rounded-full" style={{ height: '12px', width: '33%' }} />
                                            <div className="skeleton rounded-full" style={{ height: '16px', width: '100%' }} />
                                            <div className="skeleton rounded-full" style={{ height: '16px', width: '66%' }} />
                                            <div className="skeleton rounded-full" style={{ height: '24px', width: '50%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-24">
                                <div
                                    className="mx-auto mb-6 rounded-full flex items-center justify-center"
                                    style={{
                                        width: '96px',
                                        height: '96px',
                                        background: 'var(--color-neutral-100)'
                                    }}
                                >
                                    <Search style={{ width: '40px', height: '40px', color: 'var(--color-neutral-300)' }} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
                                    Tidak ada produk ditemukan
                                </h3>
                                <p className="text-muted mb-6">Coba kata kunci atau kategori lain</p>
                                <Link to="/produk" className="btn btn-primary">
                                    Lihat Semua Produk
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="products-grid">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta.total_pages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-10">
                                        <button
                                            onClick={() => updateParams('page', Math.max(1, page - 1).toString())}
                                            disabled={page === 1}
                                            className="btn btn-secondary text-sm"
                                            style={{ opacity: page === 1 ? 0.5 : 1 }}
                                        >
                                            Sebelumnya
                                        </button>

                                        <div className="flex gap-1">
                                            {[...Array(Math.min(meta.total_pages, 5))].map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => updateParams('page', pageNum.toString())}
                                                        className="rounded-xl font-medium text-sm transition"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            background: page === pageNum ? 'var(--color-primary)' : 'white',
                                                            color: page === pageNum ? 'white' : 'var(--color-neutral-600)',
                                                            border: page === pageNum ? 'none' : '1px solid var(--color-neutral-200)',
                                                            boxShadow: page === pageNum ? 'var(--shadow-primary)' : 'none'
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => updateParams('page', Math.min(meta.total_pages, page + 1).toString())}
                                            disabled={page === meta.total_pages}
                                            className="btn btn-secondary text-sm"
                                            style={{ opacity: page === meta.total_pages ? 0.5 : 1 }}
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
