import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function OrderReceipt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await adminAPI.orders.get(id);
                setOrder(response.data.order);
            } catch (error) {
                console.error('Error loading order:', error);
                alert('Gagal memuat data pesanan');
                window.close();
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const terbilang = (angka) => {
        const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

        if (angka < 12) return bilangan[angka];
        if (angka < 20) return terbilang(angka - 10) + ' Belas';
        if (angka < 100) return bilangan[Math.floor(angka / 10)] + ' Puluh ' + bilangan[angka % 10];
        if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
        if (angka < 1000) return bilangan[Math.floor(angka / 100)] + ' Ratus ' + terbilang(angka % 100);
        if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
        if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
        if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
        return angka;
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p>Memuat...</p>
            </div>
        );
    }

    if (!order) return null;

    const totalAmount = order.total_price + (order.shipping_cost || 0);

    return (
        <>
            <style>{`
                @page {
                    size: A6;
                    margin: 0;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Arial', sans-serif;
                    font-size: 10pt;
                    line-height: 1.4;
                    color: #1A1A1A;
                    background: white;
                }

                .receipt {
                    width: 148mm;
                    min-height: 105mm;
                    padding: 12mm;
                    position: relative;
                    background: white;
                }

                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 72pt;
                    font-weight: bold;
                    color: rgba(211, 47, 47, 0.05);
                    z-index: 0;
                    pointer-events: none;
                    user-select: none;
                }

                .content {
                    position: relative;
                    z-index: 1;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #D32F2F;
                }

                .logo-section {
                    flex: 1;
                }

                .store-name {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #D32F2F;
                    margin-bottom: 2px;
                }

                .tagline {
                    font-size: 8pt;
                    color: #666;
                }

                .contact-section {
                    text-align: right;
                    font-size: 8pt;
                    color: #666;
                }

                .contact-section div {
                    margin-bottom: 2px;
                }

                .metadata {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                    margin-bottom: 12px;
                    font-size: 9pt;
                }

                .meta-item {
                    display: flex;
                }

                .meta-label {
                    font-weight: 600;
                    min-width: 100px;
                    color: #333;
                }

                .meta-value {
                    color: #666;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }

                thead th {
                    background: #f5f5f5;
                    padding: 6px 4px;
                    text-align: left;
                    font-size: 9pt;
                    font-weight: 600;
                    border-bottom: 1px solid #ddd;
                }

                tbody td {
                    padding: 6px 4px;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 9pt;
                }

                .text-right {
                    text-align: right;
                    font-family: 'Courier New', monospace;
                }

                .text-center {
                    text-align: center;
                }

                .footer {
                    margin-top: 12px;
                }

                .terbilang {
                    font-style: italic;
                    color: #666;
                    margin-bottom: 8px;
                    font-size: 9pt;
                }

                .summary {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 16px;
                }

                .summary-table {
                    min-width: 200px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space between;
                    padding: 3px 0;
                    font-size: 9pt;
                }

                .summary-label {
                    flex: 1;
                }

                .summary-value {
                    font-family: 'Courier New', monospace;
                    text-align: right;
                }

                .total-row {
                    font-weight: bold;
                    font-size: 10pt;
                    padding-top: 6px;
                    border-top: 1px solid #ddd;
                }

                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }

                .signature-box {
                    text-align: center;
                    width: 45%;
                }

                .signature-label {
                    font-size: 9pt;
                    margin-bottom: 30px;
                }

                .signature-line {
                    border-top: 1px solid #333;
                    padding-top: 2px;
                    font-size: 8pt;
                }

                .footer-note {
                    text-align: center;
                    font-size: 8pt;
                    color: #666;
                    margin-top: 12px;
                    padding-top: 8px;
                    border-top: 1px solid #eee;
                }

                .no-print {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 8px 16px;
                    background: #D32F2F;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .no-print:hover {
                    background: #b71c1c;
                }

                @media print {
                    .no-print {
                        display: none;
                    }
                    
                    .receipt {
                        margin: 0;
                        padding: 8mm;
                    }
                }
            `}</style>

            <button className="no-print" onClick={handlePrint}>🖨️ Cetak</button>

            <div className="receipt">
                <div className="watermark">GSM</div>

                <div className="content">
                    {/* Header */}
                    <div className="header">
                        <div className="logo-section">
                            <div className="store-name">GSM MOTOR</div>
                            <div className="tagline">Spesialis Servis & Suku Cadang</div>
                        </div>
                        <div className="contact-section">
                            <div>Jl. Veteran No. 123, Bandung</div>
                            <div>WA: 0813-8636-3979</div>
                            <div>IG: @gsm_motor</div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="metadata">
                        <div className="meta-item">
                            <span className="meta-label">Nomor Nota:</span>
                            <span className="meta-value">{order.order_number}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Tanggal:</span>
                            <span className="meta-value">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Nama Pelanggan:</span>
                            <span className="meta-value">{order.user?.name || '-'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">No. Telepon:</span>
                            <span className="meta-value">{order.user?.phone || '-'}</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>No</th>
                                <th style={{ width: '50%' }}>Nama Produk</th>
                                <th className="text-center" style={{ width: '10%' }}>Qty</th>
                                <th className="text-right" style={{ width: '17%' }}>Harga</th>
                                <th className="text-right" style={{ width: '18%' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>{item.product?.name || 'Produk'}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">{formatPrice(item.price_at_purchase)}</td>
                                    <td className="text-right">{formatPrice(item.quantity * item.price_at_purchase)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="footer">
                        <div className="terbilang">
                            Terbilang: <strong>{terbilang(totalAmount)} Rupiah</strong>
                        </div>

                        <div className="summary">
                            <div className="summary-table">
                                <div className="summary-row">
                                    <span className="summary-label">Subtotal:</span>
                                    <span className="summary-value">Rp {formatPrice(order.total_price)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Ongkir:</span>
                                    <span className="summary-value">Rp {formatPrice(order.shipping_cost || 0)}</span>
                                </div>
                                <div className="summary-row total-row">
                                    <span className="summary-label">TOTAL:</span>
                                    <span className="summary-value">Rp {formatPrice(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="signatures">
                            <div className="signature-box">
                                <div className="signature-label">Penerima,</div>
                                <div className="signature-line">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-label">Admin,</div>
                                <div className="signature-line">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div>
                            </div>
                        </div>

                        <div className="footer-note">
                            Terima kasih telah mempercayakan kendaraan Anda pada GSM Motor
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
