import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {category ? category.name : search ? `Hasil pencarian: "${search}"` : 'Semua Produk'}
                            </h1>
                            <p className="text-gray-500 text-sm">{meta.total || 0} produk ditemukan</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => updateParams('search', e.target.value)}
                                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsm-orange/20 focus:border-gsm-orange"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>

                            {/* Sort */}
                            <select
                                value={sort}
                                onChange={(e) => updateParams('sort', e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsm-orange/20 focus:border-gsm-orange"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="price_asc">Harga: Rendah ke Tinggi</option>
                                <option value="price_desc">Harga: Tinggi ke Rendah</option>
                                <option value="name">Nama A-Z</option>
                            </select>

                            {/* Filter Toggle (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden p-2 border border-gray-200 rounded-lg"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(search || categorySlug) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {search && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gsm-orange/10 text-gsm-orange rounded-full text-sm">
                                    Pencarian: {search}
                                    <button onClick={() => updateParams('search', '')} className="hover:bg-gsm-orange/20 rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Sidebar - Categories */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
                        <div className="bg-white rounded-xl p-4 sticky top-36">
                            <h3 className="font-semibold text-gray-800 mb-3">Kategori</h3>
                            <div className="space-y-1">
                                <a
                                    href="/produk"
                                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!categorySlug ? 'bg-gsm-orange/10 text-gsm-orange font-medium' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Semua Produk
                                </a>
                                {categories.map((cat) => (
                                    <a
                                        key={cat.id}
                                        href={`/kategori/${cat.slug}`}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${categorySlug === cat.slug ? 'bg-gsm-orange/10 text-gsm-orange font-medium' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden">
                                        <div className="aspect-square skeleton" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 skeleton w-3/4" />
                                            <div className="h-4 skeleton w-1/2" />
                                            <div className="h-6 skeleton w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada produk ditemukan</h3>
                                <p className="text-gray-500">Coba kata kunci atau kategori lain</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta.total_pages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {[...Array(Math.min(meta.total_pages, 5))].map((_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => updateParams('page', pageNum.toString())}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === pageNum
                                                            ? 'bg-gsm-orange text-white'
                                                            : 'bg-white text-gray-600 hover:bg-gray-50 border'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
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
