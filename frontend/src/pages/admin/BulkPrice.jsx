import { useState } from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function BulkPrice() {
    const [percentage, setPercentage] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const value = parseFloat(percentage);
        if (isNaN(value) || value < -100 || value > 100) {
            toast.error('Persentase harus -100 sampai 100');
            return;
        }

        if (!confirm(`Anda yakin ingin ${value >= 0 ? 'menaikkan' : 'menurunkan'} semua harga sebesar ${Math.abs(value)}%?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await adminAPI.products.bulkPrice(value);
            setResult(response.data);
            toast.success(`${response.data.count} produk diperbarui`);
            setPercentage('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal memperbarui harga');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ubah Harga Massal</h1>

            <div className="max-w-md">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Perhatian</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                        Fitur ini akan mengubah SEMUA harga produk sekaligus. Pastikan persentase yang dimasukkan benar.
                        Harga akan dibulatkan ke atas ke kelipatan 100.
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Persentase Perubahan (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={percentage}
                                    onChange={(e) => setPercentage(e.target.value)}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Contoh: 5 atau -10"
                                    required
                                />
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Positif untuk menaikkan, negatif untuk menurunkan
                            </p>
                        </div>

                        {percentage && !isNaN(parseFloat(percentage)) && (
                            <div className={`p-4 rounded-lg ${parseFloat(percentage) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className={parseFloat(percentage) >= 0 ? 'text-green-700' : 'text-red-700'}>
                                    Contoh: Rp 100.000 → Rp {new Intl.NumberFormat('id-ID').format(
                                        Math.ceil(100000 * (1 + parseFloat(percentage) / 100) / 100) * 100
                                    )}
                                </p>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Memproses...' : 'Terapkan Perubahan'}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-green-700 font-medium">
                                ✓ {result.count} produk berhasil diperbarui
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
