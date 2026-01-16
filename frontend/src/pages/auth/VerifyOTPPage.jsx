import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerifyOTPPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Masukkan 6 digit kode OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.verifyOTP({ email, otp: otpCode });

            // Save tokens and user
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            setUser(response.data.user);

            toast.success('Verifikasi berhasil!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Kode OTP salah');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setResending(true);

        try {
            await authAPI.resendOTP({ email });
            toast.success('Kode OTP baru telah dikirim');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Gagal mengirim ulang OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E5E7EB 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
                    <img src="/logo.webp" alt="GSM Motor" className="w-12 h-12 transition-transform group-hover:scale-110" />
                    <div className="text-center">
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-neutral-800)' }}>GSM Motor</h1>
                        <p className="text-xs text-muted">Sparepart Motor Terlengkap</p>
                    </div>
                </Link>

                {/* Card */}
                <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
                    {/* Icon Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="flex items-center justify-center rounded-full mb-4"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                            }}
                        >
                            <Mail style={{ width: '36px', height: '36px', color: 'white' }} />
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-neutral-800)' }}>
                            Verifikasi Email
                        </h2>
                        <p className="text-center text-muted" style={{ lineHeight: '1.6' }}>
                            Masukkan kode 6 digit yang telah<br />dikirim ke <strong style={{ color: 'var(--color-neutral-700)' }}>{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-3 mb-8">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="text-center text-2xl font-bold rounded-xl transition-all"
                                    style={{
                                        width: '56px',
                                        height: '64px',
                                        border: digit ? '2px solid var(--color-primary)' : '2px solid var(--color-neutral-200)',
                                        background: digit ? 'rgba(255, 107, 0, 0.05)' : 'white',
                                        color: 'var(--color-neutral-800)',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => !digit && (e.target.style.borderColor = 'var(--color-neutral-200)')}
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                            style={{
                                height: '56px',
                                fontSize: '1.125rem',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memverifikasi...</span>
                                </div>
                            ) : (
                                'Verifikasi Sekarang'
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted mb-3">
                            Tidak menerima kode OTP?
                        </p>
                        {countdown > 0 ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'var(--color-neutral-100)' }}>
                                <RefreshCw style={{ width: '16px', height: '16px', color: 'var(--color-neutral-400)' }} />
                                <span className="text-sm font-medium text-muted">
                                    Kirim ulang dalam {countdown} detik
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                                style={{
                                    background: resending ? 'var(--color-neutral-200)' : 'rgba(255, 107, 0, 0.1)',
                                    color: resending ? 'var(--color-neutral-500)' : 'var(--color-primary)',
                                    cursor: resending ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {resending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Mengirim...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw style={{ width: '16px', height: '16px' }} />
                                        <span>Kirim Ulang Kode</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Back to Login */}
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 mt-6 text-sm font-medium text-muted hover:text-primary transition-colors"
                    >
                        <ArrowLeft style={{ width: '16px', height: '16px' }} />
                        <span>Kembali ke Login</span>
                    </Link>
                </div>

                {/* Footer Info */}
                <p className="text-center text-sm text-muted mt-6">
                    Kode OTP akan kadaluarsa dalam 10 menit
                </p>
            </div>
        </div>
    );
}
