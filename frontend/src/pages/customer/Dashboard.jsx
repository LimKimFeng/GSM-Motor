import { Link } from 'react-router-dom';
import { Package, ShoppingCart, User, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../context/store';

export default function Dashboard() {
    const { user } = useAuthStore();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Welcome */}
            <div className="bg-gradient-to-r from-gsm-orange to-gsm-orange-light rounded-xl p-6 text-white mb-6">
                <h2 className="text-xl font-semibold mb-1">Halo, {user?.name}! 👋</h2>
                <p className="opacity-90">Selamat datang kembali di GSM Motor</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link to="/orders" className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-800">Pesanan Saya</h3>
                        <p className="text-sm text-gray-500">Lihat riwayat pesanan</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link to="/keranjang" className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-800">Keranjang</h3>
                        <p className="text-sm text-gray-500">Lanjutkan belanja</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>

                <Link to="/profil" className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-800">Profil</h3>
                        <p className="text-sm text-gray-500">Edit data diri</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Informasi Akun</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nama</p>
                        <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-medium">{user?.phone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status Alamat</p>
                        <p className="font-medium">
                            {user?.has_address ? (
                                <span className="text-green-600">✓ Lengkap</span>
                            ) : (
                                <span className="text-yellow-600">Belum Lengkap</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
