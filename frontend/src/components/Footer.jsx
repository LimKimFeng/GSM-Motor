import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Instagram, Youtube, Send } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            {/* Newsletter Section */}
            <div style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
                <div className="container py-10">
                    <div className="flex flex-col md:flex items-center justify-between gap-6" style={{ flexDirection: 'row' }}>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Dapatkan Update Terbaru
                            </h3>
                            <p className="text-sm text-muted">
                                Promo eksklusif & produk baru langsung ke inbox Anda
                            </p>
                        </div>
                        <div className="flex w-full" style={{ maxWidth: '24rem' }}>
                            <input
                                type="email"
                                placeholder="Masukkan email Anda"
                                className="flex-1 text-sm"
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-neutral-800)',
                                    border: '1px solid var(--color-neutral-700)',
                                    borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button
                                className="flex items-center gap-2 font-semibold text-white transition"
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: 'var(--color-primary)',
                                    borderRadius: '0 var(--radius-lg) var(--radius-lg) 0'
                                }}
                            >
                                <Send style={{ width: '16px', height: '16px' }} />
                                <span className="hidden sm:inline">Subscribe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container py-12">
                <div className="grid gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
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
                                <h3 className="font-bold text-white" style={{ fontSize: '1.125rem' }}>GSM Motor</h3>
                                <p className="text-xs text-muted">Est. 2020</p>
                            </div>
                        </div>
                        <p className="text-sm mb-5" style={{ color: 'var(--color-neutral-400)', lineHeight: '1.7' }}>
                            Pusat sparepart motor terlengkap dengan harga terjangkau.
                            Melayani pengiriman ke seluruh Indonesia dengan garansi 100% original.
                        </p>
                        <a
                            href="https://wa.me/6281386363979"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-medium text-white rounded-xl transition"
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: '#22C55E'
                            }}
                        >
                            <MessageCircle style={{ width: '20px', height: '20px' }} />
                            Chat WhatsApp
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wide">
                            Link Cepat
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { to: '/', label: 'Beranda' },
                                { to: '/produk', label: 'Semua Produk' },
                                { to: '/keranjang', label: 'Keranjang Belanja' },
                                { to: '/login', label: 'Login / Daftar' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="footer-link flex items-center gap-2 text-sm">
                                        <span
                                            className="rounded-full"
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                background: 'var(--color-neutral-600)'
                                            }}
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wide">
                            Hubungi Kami
                        </h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li className="flex items-start gap-3">
                                <div
                                    className="flex items-center justify-center rounded-lg shrink-0"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'var(--color-neutral-800)'
                                    }}
                                >
                                    <Phone style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">0813-8636-3979</p>
                                    <p className="text-xs text-muted">WhatsApp / Telepon</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div
                                    className="flex items-center justify-center rounded-lg shrink-0"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'var(--color-neutral-800)'
                                    }}
                                >
                                    <Mail style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">info@gsmmotor.com</p>
                                    <p className="text-xs text-muted">Email Support</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div
                                    className="flex items-center justify-center rounded-lg shrink-0"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'var(--color-neutral-800)'
                                    }}
                                >
                                    <Clock style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">Senin - Sabtu</p>
                                    <p className="text-xs text-muted">08:00 - 17:00 WIB</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Payment & Shipping */}
                    <div>
                        <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wide">
                            Pengiriman
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['JNE', 'J&T', 'Grab', 'Gojek', 'COD'].map((courier) => (
                                <span
                                    key={courier}
                                    className="text-xs font-medium rounded-lg"
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        background: 'var(--color-neutral-800)',
                                        border: '1px solid var(--color-neutral-700)',
                                        color: 'var(--color-neutral-300)'
                                    }}
                                >
                                    {courier}
                                </span>
                            ))}
                        </div>

                        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                            Pembayaran
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Transfer Bank', 'QRIS', 'E-Wallet'].map((method) => (
                                <span
                                    key={method}
                                    className="text-xs font-medium rounded-lg"
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        background: 'var(--color-neutral-800)',
                                        border: '1px solid var(--color-neutral-700)',
                                        color: 'var(--color-neutral-300)'
                                    }}
                                >
                                    {method}
                                </span>
                            ))}
                        </div>

                        {/* Social Links */}
                        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                            Ikuti Kami
                        </h4>
                        <div className="flex gap-2">
                            {[
                                { icon: Facebook, label: 'Facebook' },
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Youtube, label: 'YouTube' },
                            ].map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="flex items-center justify-center rounded-lg transition"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'var(--color-neutral-800)',
                                        border: '1px solid var(--color-neutral-700)',
                                        color: 'var(--color-neutral-400)'
                                    }}
                                >
                                    <Icon style={{ width: '16px', height: '16px' }} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid var(--color-neutral-800)' }}>
                <div className="container py-5">
                    <div className="flex flex-col md:flex justify-between items-center gap-3" style={{ flexDirection: 'row' }}>
                        <p className="text-sm text-muted">
                            © {currentYear} GSM Motor. All rights reserved.
                        </p>
                        <p className="text-sm text-muted flex items-center gap-1">
                            Made with <span style={{ color: '#EF4444' }}>❤️</span> for Indonesian Bikers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
