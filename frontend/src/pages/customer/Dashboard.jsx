import { Link } from 'react-router-dom';
import { Package, ShoppingCart, User, ChevronRight, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../context/store';

export default function Dashboard() {
    const { user } = useAuthStore();

    const quickActions = [
        {
            to: '/orders',
            icon: Package,
            label: 'Pesanan Saya',
            desc: 'Lihat riwayat pesanan',
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            to: '/keranjang',
            icon: ShoppingCart,
            label: 'Keranjang',
            desc: 'Lanjutkan belanja',
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            to: '/profil',
            icon: User,
            label: 'Profil',
            desc: 'Edit data diri',
            color: '#8B5CF6',
            bgColor: 'rgba(139, 92, 246, 0.1)'
        },
    ];

    return (
        <div className="container py-8">
            {/* Page Title */}
            <h1
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--color-neutral-800)' }}
            >
                Dashboard
            </h1>

            {/* Welcome Banner */}
            <div
                className="rounded-2xl mb-8 relative overflow-hidden"
                style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #E85A2A 50%, #C4481F 100%)',
                    boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)'
                }}
            >
                {/* Decorative circle */}
                <div
                    className="rounded-full"
                    style={{
                        position: 'absolute',
                        top: '-3rem',
                        right: '-3rem',
                        width: '12rem',
                        height: '12rem',
                        background: 'rgba(255, 255, 255, 0.1)'
                    }}
                />
                <div
                    className="rounded-full"
                    style={{
                        position: 'absolute',
                        bottom: '-2rem',
                        right: '4rem',
                        width: '8rem',
                        height: '8rem',
                        background: 'rgba(255, 255, 255, 0.05)'
                    }}
                />

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontSize: '1.5rem' }}>👋</span>
                        <h2 className="text-xl font-semibold text-white">
                            Halo, {user?.name}!
                        </h2>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Selamat datang kembali di GSM Motor
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="grid gap-4 mb-8"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
            >
                {quickActions.map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="card flex items-center gap-4 transition"
                        style={{ padding: '1.25rem' }}
                    >
                        <div
                            className="flex items-center justify-center rounded-2xl shrink-0"
                            style={{
                                width: '56px',
                                height: '56px',
                                background: action.bgColor
                            }}
                        >
                            <action.icon style={{ width: '24px', height: '24px', color: action.color }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                                {action.label}
                            </h3>
                            <p className="text-sm text-muted">{action.desc}</p>
                        </div>
                        <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--color-neutral-300)' }} />
                    </Link>
                ))}
            </div>

            {/* Account Info */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold" style={{ fontSize: '1.125rem', color: 'var(--color-neutral-800)' }}>
                        Informasi Akun
                    </h3>
                    <Link
                        to="/profil"
                        className="text-sm font-medium text-primary flex items-center gap-1"
                    >
                        Edit Profil
                        <ChevronRight style={{ width: '14px', height: '14px' }} />
                    </Link>
                </div>

                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                >
                    <div
                        className="rounded-xl"
                        style={{ padding: '1rem', background: 'var(--color-neutral-50)' }}
                    >
                        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                            Nama
                        </p>
                        <p className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                            {user?.name}
                        </p>
                    </div>

                    <div
                        className="rounded-xl"
                        style={{ padding: '1rem', background: 'var(--color-neutral-50)' }}
                    >
                        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                            Email
                        </p>
                        <p className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                            {user?.email}
                        </p>
                    </div>

                    <div
                        className="rounded-xl"
                        style={{ padding: '1rem', background: 'var(--color-neutral-50)' }}
                    >
                        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                            Telepon
                        </p>
                        <p className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>
                            {user?.phone || '-'}
                        </p>
                    </div>

                    <div
                        className="rounded-xl"
                        style={{ padding: '1rem', background: 'var(--color-neutral-50)' }}
                    >
                        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                            Status Alamat
                        </p>
                        <p className="font-semibold flex items-center gap-2">
                            {user?.has_address ? (
                                <>
                                    <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--color-success)' }} />
                                    <span style={{ color: 'var(--color-success)' }}>Lengkap</span>
                                </>
                            ) : (
                                <>
                                    <Clock style={{ width: '16px', height: '16px', color: 'var(--color-warning)' }} />
                                    <span style={{ color: 'var(--color-warning)' }}>Belum Lengkap</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
