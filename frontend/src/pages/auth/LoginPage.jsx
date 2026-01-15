import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(form.email, form.password);
            toast.success('Login berhasil!');
            if (result.user?.role === 'admin' || result.user?.role === 'subadmin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.requires_otp) {
                navigate('/verify-otp', { state: { email: form.email } });
                return;
            }
            toast.error(errorData?.error || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/google/redirect`;
    };

    return (
        <div className="auth-page">
            {/* Left Side - Visual */}
            <div
                className="auth-visual"
                style={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 50%, #C4481F 100%)',
                    display: 'none'
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+\")",
                        opacity: 0.5
                    }}
                />

                {/* Decorative Circles */}
                <div
                    className="rounded-full"
                    style={{
                        position: 'absolute',
                        top: '-6rem',
                        left: '-6rem',
                        width: '24rem',
                        height: '24rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(48px)'
                    }}
                />

                {/* Content */}
                <div
                    className="flex flex-col justify-center"
                    style={{ position: 'relative', zIndex: 10, padding: '4rem', width: '100%' }}
                >
                    <div style={{ maxWidth: '28rem' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div
                                className="flex items-center justify-center rounded-2xl"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <span className="text-white font-bold text-xl">GSM</span>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-2xl">GSM Motor</h1>
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Sparepart Motor Terlengkap</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-4" style={{ lineHeight: '1.2' }}>
                            Selamat Datang Kembali!
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem', marginBottom: '2rem' }}>
                            Masuk ke akun Anda untuk melanjutkan belanja sparepart motor berkualitas.
                        </p>

                        {/* Feature List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Akses histori pesanan', 'Simpan alamat pengiriman', 'Dapatkan promo eksklusif'].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div
                                        className="flex items-center justify-center rounded-full"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            background: 'rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <Sparkles style={{ width: '14px', height: '14px', color: 'white' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div
                            className="flex items-center justify-center rounded-xl shadow-primary"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 100%)'
                            }}
                        >
                            <span className="text-white font-bold" style={{ fontSize: '1.125rem' }}>GSM</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-xl" style={{ color: 'var(--color-neutral-800)' }}>GSM Motor</h1>
                        </div>
                    </Link>

                    {/* Card */}
                    <div className="auth-card">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
                                Masuk
                            </h2>
                            <p className="text-muted">Masukkan email dan password Anda</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="input-field input-with-icon"
                                        placeholder="email@example.com"
                                        required
                                    />
                                    <Mail className="input-icon" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="input-field input-with-icon"
                                        style={{ paddingRight: '3rem' }}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <Lock className="input-icon" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="transition"
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--color-neutral-400)',
                                            background: 'none',
                                            border: 'none'
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff style={{ width: '20px', height: '20px' }} />
                                        ) : (
                                            <Eye style={{ width: '20px', height: '20px' }} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                                style={{
                                    padding: '0.875rem',
                                    opacity: loading ? 0.5 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <div className="spinner-sm" style={{ borderTopColor: 'white' }}></div>
                                ) : (
                                    <>
                                        Masuk
                                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1" style={{ height: '1px', background: 'var(--color-neutral-200)' }} />
                            <span className="text-sm text-muted">atau</span>
                            <div className="flex-1" style={{ height: '1px', background: 'var(--color-neutral-200)' }} />
                        </div>

                        {/* Google Login */}
                        <button
                            onClick={handleGoogleLogin}
                            className="btn btn-secondary w-full"
                            style={{ padding: '0.875rem' }}
                        >
                            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="font-medium" style={{ color: 'var(--color-neutral-700)' }}>Masuk dengan Google</span>
                        </button>

                        {/* Register Link */}
                        <p className="text-center mt-8 text-muted">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-semibold text-primary">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>

                    {/* Back to home */}
                    <p className="text-center mt-6">
                        <Link to="/" className="text-sm text-muted">
                            ← Kembali ke Beranda
                        </Link>
                    </p>
                </div>
            </div>

            {/* CSS for lg:flex on auth-visual */}
            <style>{`
                @media (min-width: 1024px) {
                    .auth-visual { display: flex !important; }
                    .lg\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
