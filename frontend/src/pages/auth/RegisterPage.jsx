import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        website: '', // Honeypot
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirm_password) {
            toast.error('Password tidak cocok');
            return;
        }

        if (form.password.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register(form);
            toast.success('Registrasi berhasil! Silakan verifikasi email.');
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center">
                        <span className="text-white font-bold text-xl">GSM</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-2xl text-gray-800">GSM Motor</h1>
                    </div>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun</h2>
                    <p className="text-gray-500 mb-6">Daftar untuk mulai belanja</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Honeypot - hidden */}
                        <input
                            type="text"
                            name="website"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                        />

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field pl-11"
                                    placeholder="John Doe"
                                    required
                                />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field pl-11"
                                    placeholder="email@example.com"
                                    required
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nomor HP
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input-field pl-11"
                                    placeholder="08123456789"
                                    required
                                />
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pl-11 pr-11"
                                    placeholder="Minimal 6 karakter"
                                    required
                                    minLength={6}
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.confirm_password}
                                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    className="input-field pl-11"
                                    placeholder="Ulangi password"
                                    required
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Daftar <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-gsm-orange font-medium hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
