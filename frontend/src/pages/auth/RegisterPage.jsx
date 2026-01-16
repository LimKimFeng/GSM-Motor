import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, Zap, Gift } from 'lucide-react';
import { authAPI } from '../../services/api';
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

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        website: '',
    });

    // Auto-change background image
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthMap = {
            0: { label: '', color: '' },
            1: { label: 'Lemah', color: 'var(--color-error)' },
            2: { label: 'Cukup', color: 'var(--color-warning)' },
            3: { label: 'Baik', color: 'var(--color-info)' },
            4: { label: 'Kuat', color: 'var(--color-success)' },
            5: { label: 'Sangat Kuat', color: '#059669' },
        };

        return { score, ...strengthMap[score] };
    };

    const passwordStrength = getPasswordStrength(form.password);

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
                        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.85) 100%)',
                        zIndex: 1
                    }}
                />

                {/* Orange Gradient Accent */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, transparent 50%)',
                        zIndex: 2
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
                                className="flex items-center justify-center rounded-2xl shadow-primary overflow-hidden"
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'white',
                                    animation: 'float 4s ease-in-out infinite'
                                }}
                            >
                                <img src="/logo.webp" alt="GSM Motor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-2xl">GSM Motor</h1>
                                <p className="text-sm text-muted">Sparepart Motor Terlengkap</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-4" style={{ lineHeight: '1.2', animation: 'slideUp 0.6s ease-out 0.1s backwards' }}>
                            Bergabung Bersama Kami
                        </h2>
                        <p className="text-muted mb-10" style={{ fontSize: '1.125rem', animation: 'slideUp 0.6s ease-out 0.2s backwards' }}>
                            Daftar sekarang dan nikmati berbagai keuntungan sebagai member GSM Motor.
                        </p>

                        {/* Benefits */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { icon: Gift, title: 'Diskon Eksklusif', desc: 'Harga khusus untuk member' },
                                { icon: Zap, title: 'Checkout Cepat', desc: 'Simpan data untuk transaksi mudah' },
                                { icon: Shield, title: 'Keamanan Terjamin', desc: 'Data Anda dilindungi enkripsi' },
                            ].map((benefit, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4"
                                    style={{
                                        animation: `slideUp 0.5s ease-out ${0.3 + idx * 0.1}s backwards`
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-xl shrink-0"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 107, 53, 0.05) 100%)',
                                            border: '1px solid rgba(255, 107, 53, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <benefit.icon style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{benefit.title}</h3>
                                        <p className="text-sm text-muted">{benefit.desc}</p>
                                    </div>
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
                                        background: idx === currentImageIndex ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container overflow-auto">
                <div style={{ width: '100%', maxWidth: '28rem', padding: '2rem 0' }}>
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
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
                                Buat Akun
                            </h2>
                            <p className="text-muted">Lengkapi data untuk mendaftar</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Honeypot */}
                            <input
                                type="text"
                                name="website"
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                style={{ display: 'none' }}
                                tabIndex={-1}
                                autoComplete="off"
                            />

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="input-field input-with-icon"
                                        placeholder="John Doe"
                                        required
                                    />
                                    <User className="input-icon" />
                                </div>
                            </div>

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

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Nomor HP
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="input-field input-with-icon"
                                        placeholder="08123456789"
                                        required
                                    />
                                    <Phone className="input-icon" />
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
                                        placeholder="Minimal 6 karakter"
                                        required
                                        minLength={6}
                                    />
                                    <Lock className="input-icon" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
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
                                        {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                                    </button>
                                </div>
                                {/* Password Strength */}
                                {form.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className="flex-1 rounded-full password-strength-bar"
                                                    style={{
                                                        height: '4px',
                                                        background: level <= passwordStrength.score
                                                            ? `linear-gradient(90deg, ${passwordStrength.color}, ${passwordStrength.color}bb)`
                                                            : 'var(--color-neutral-200)',
                                                        transform: level <= passwordStrength.score ? 'scaleX(1)' : 'scaleX(0.95)',
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        transformOrigin: 'left'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted">
                                            Kekuatan: <span className="font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirm_password}
                                        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                        className="input-field input-with-icon"
                                        style={{
                                            borderColor: form.confirm_password && form.password !== form.confirm_password
                                                ? 'var(--color-error)'
                                                : form.confirm_password && form.password === form.confirm_password
                                                    ? 'var(--color-success)'
                                                    : 'transparent'
                                        }}
                                        placeholder="Ulangi password"
                                        required
                                    />
                                    <Lock className="input-icon" />
                                </div>
                                {form.confirm_password && form.password !== form.confirm_password && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>Password tidak cocok</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mt-2"
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
                                        Daftar
                                        <ArrowRight style={{ width: '16px', height: '16px' }} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <p className="text-center mt-6 text-muted">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-semibold text-primary">
                                Masuk
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

                /* Custom scrollbar for form container */
                .auth-form-container::-webkit-scrollbar {
                    width: 6px;
                }

                .auth-form-container::-webkit-scrollbar-track {
                    background: transparent;
                }

                .auth-form-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 107, 53, 0.3);
                    border-radius: 3px;
                }

                .auth-form-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 107, 53, 0.5);
                }
            `}</style>
        </div>
    );
}
