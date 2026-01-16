import { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, Award } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SubadminPerformance() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        total_with_submitter: 0,
        total_without_submitter: 0,
        unique_submitters: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.subadminStats();
            setStats(response.data.data || []);
            setSummary({
                total_with_submitter: response.data.total_with_submitter || 0,
                total_without_submitter: response.data.total_without_submitter || 0,
                unique_submitters: response.data.unique_submitters || 0
            });
        } catch (error) {
            toast.error('Gagal memuat statistik');
        } finally {
            setLoading(false);
        }
    };

    const getTopPerformer = () => {
        if (stats.length === 0) return null;
        return stats[0];
    };

    const topPerformer = getTopPerformer();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kinerja Subadmin</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Tracking produk yang diupload oleh setiap subadmin
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Subadmin</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.unique_submitters}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Produk dengan Submitter</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.total_with_submitter}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Produk tanpa Submitter</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.total_without_submitter}</p>
                        </div>
                    </div>
                </div>

                {topPerformer && (
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-5 shadow-sm text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-white/80">Top Performer</p>
                                <p className="text-xl font-bold">{topPerformer.name}</p>
                                <p className="text-sm text-white/80">{topPerformer.product_count} produk</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Table */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gsm-orange" />
                        Statistik Upload Produk per Subadmin
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Peringkat</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Nama Subadmin</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Jumlah Produk</th>
                                <th className="px-4 py-3 text-sm font-medium text-gray-600">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        Memuat statistik...
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada data. Subadmin perlu mengisi field "Submit by" saat upload produk.
                                    </td>
                                </tr>
                            ) : (
                                stats.map((stat, index) => {
                                    const maxCount = stats[0]?.product_count || 1;
                                    const percentage = (stat.product_count / maxCount) * 100;

                                    return (
                                        <tr key={stat.name} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-200 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-800">{stat.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                                                    <Package className="w-4 h-4" />
                                                    {stat.product_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 w-48">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gsm-orange h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
