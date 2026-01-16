import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';

const backgroundImages = [
    '/images/motorcyle_pict1.webp',
    '/images/motorcyle_pict2.webp',
    '/images/motorcyle_pict3.webp',
    '/images/motorcyle_pict4.webp',
    '/images/motorcyle_pict5.webp',
    '/images/motorcyle_pict6.webp',
    '/images/motorcyle_pict7.webp',
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auto-change background image
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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

    return (
        <div className="auth-page">
            {/* Left Side - Visual with Image Slider */}
            <div
                className="auth-visual"
                style={{
                    position: 'relative',
                    display: 'none',
                    overflow: 'hidden'
                }}
            >
                {/* Background Images */}
                {backgroundImages.map((img, index) => (
                    <div
                        key={img}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: index === currentImageIndex ? 1 : 0,
                            transition: 'opacity 1s ease-in-out'
                        }}
                    />
                ))}

                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.85) 0%, rgba(232, 90, 42, 0.75) 50%, rgba(196, 72, 31, 0.85) 100%)',
                        zIndex: 1
                    }}
                />

                {/* Content */}
                <div
                    className="flex flex-col justify-center"
                    style={{ position: 'relative', zIndex: 10, padding: '4rem', width: '100%' }}
                >
                    <div style={{ maxWidth: '28rem' }}>
                        <div className="flex items-center gap-3 mb-8" style={{ animation: 'slideUp 0.6s ease-out' }}>
                            <div
                                className="flex items-center justify-center rounded-2xl overflow-hidden"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    animation: 'float 4s ease-in-out infinite'
                                }}
                            >
                                <img src="/logo.webp" alt="GSM Motor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-2xl">GSM Motor</h1>
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Sparepart Motor Terlengkap</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-4" style={{ lineHeight: '1.2', animation: 'slideUp 0.6s ease-out 0.1s backwards' }}>
                            Selamat Datang Kembali!
                        </h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem', marginBottom: '2rem', animation: 'slideUp 0.6s ease-out 0.2s backwards' }}>
                            Masuk ke akun Anda untuk melanjutkan belanja sparepart motor berkualitas.
                        </p>

                        {/* Feature List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Akses histori pesanan', 'Simpan alamat pengiriman', 'Dapatkan promo eksklusif'].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3"
                                    style={{
                                        animation: `slideUp 0.5s ease-out ${0.3 + idx * 0.1}s backwards`
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-full"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Sparkles style={{ width: '14px', height: '14px', color: 'white' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Image Indicators */}
                        <div className="flex gap-2 mt-8">
                            {backgroundImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className="rounded-full transition-all"
                                    style={{
                                        width: idx === currentImageIndex ? '24px' : '8px',
                                        height: '8px',
                                        background: idx === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.4)'
                                    }}
                                />
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
                            className="flex items-center justify-center rounded-xl shadow-primary overflow-hidden"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'white'
                            }}
                        >
                            <img src="/logo.webp" alt="GSM Motor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                                    <Mail
                                        className="input-icon"
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '20px',
                                            height: '20px',
                                            color: 'var(--color-neutral-400)',
                                            pointerEvents: 'none'
                                        }}
                                    />
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
                                    <Lock
                                        className="input-icon"
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '20px',
                                            height: '20px',
                                            color: 'var(--color-neutral-400)',
                                            pointerEvents: 'none'
                                        }}
                                    />
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

                /* Floating animation */
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}
