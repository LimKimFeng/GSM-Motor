import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';

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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center">
                        <span className="text-white font-bold text-xl">GSM</span>
                    </div>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gsm-orange/10 flex items-center justify-center">
                        <span className="text-3xl">📧</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Email</h2>
                    <p className="text-gray-500 mb-6">
                        Masukkan kode 6 digit yang dikirim ke<br />
                        <span className="font-medium text-gray-700">{email}</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-2 mb-6">
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
                                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gsm-orange transition-colors"
                                />
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : (
                                'Verifikasi'
                            )}
                        </button>
                    </form>

                    {/* Resend */}
                    <p className="mt-6 text-gray-600">
                        Tidak menerima kode?{' '}
                        {countdown > 0 ? (
                            <span className="text-gray-400">Kirim ulang dalam {countdown}s</span>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-gsm-orange font-medium hover:underline disabled:opacity-50"
                            >
                                {resending ? 'Mengirim...' : 'Kirim Ulang'}
                            </button>
                        )}
                    </p>

                    {/* Back to Login */}
                    <Link
                        to="/login"
                        className="block mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
