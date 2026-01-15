import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                                <span className="text-white font-bold text-lg">GSM</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">GSM Motor</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Pusat sparepart motor terlengkap dengan harga terjangkau.
                            Melayani pengiriman ke seluruh Indonesia.
                        </p>
                        <a
                            href="https://wa.me/6281386363979"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Chat WhatsApp
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Link Cepat</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-gsm-orange transition-colors">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link to="/produk" className="hover:text-gsm-orange transition-colors">
                                    Semua Produk
                                </Link>
                            </li>
                            <li>
                                <Link to="/keranjang" className="hover:text-gsm-orange transition-colors">
                                    Keranjang Belanja
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-gsm-orange transition-colors">
                                    Login / Daftar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gsm-orange shrink-0 mt-0.5" />
                                <div>
                                    <p>0813-8636-3979</p>
                                    <p className="text-gray-500 text-xs">WhatsApp / Telepon</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gsm-orange shrink-0 mt-0.5" />
                                <div>
                                    <p>info@gsmmotor.com</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gsm-orange shrink-0 mt-0.5" />
                                <div>
                                    <p>Senin - Sabtu</p>
                                    <p className="text-gray-500 text-xs">08:00 - 17:00 WIB</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Payment & Shipping */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Pengiriman</h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">JNE</span>
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">J&T</span>
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">Grab</span>
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">Gojek</span>
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">COD</span>
                        </div>

                        <h4 className="font-semibold text-white mt-6 mb-4">Pembayaran</h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-gray-800 rounded text-xs">Transfer Bank</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
                        <p>© {currentYear} GSM Motor. All rights reserved.</p>
                        <p>Made with ❤️ for Indonesian Bikers</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
