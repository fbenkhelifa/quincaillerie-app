import { forwardRef } from 'react';
import { numberToWordsFR, numberToWordsAR } from '@/utils/numberToWords';

const PrintableInvoice = forwardRef(({ bill, storeSettings, lang = 'fr' }, ref) => {
    const isArabic = lang === 'ar';
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + ' DA';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const totalInWords = isArabic 
        ? numberToWordsAR(bill.total) 
        : numberToWordsFR(bill.total);

    const paymentMethods = {
        cash: isArabic ? 'نقدا' : 'Espèces',
        card: isArabic ? 'بطاقة' : 'Carte',
        check: isArabic ? 'شيك' : 'Chèque',
        credit: isArabic ? 'دين' : 'Crédit',
        other: isArabic ? 'أخرى' : 'Autre',
    };

    const labels = {
        invoice: isArabic ? 'فاتورة' : 'FACTURE',
        date: isArabic ? 'التاريخ' : 'Date',
        client: isArabic ? 'الزبون' : 'Client',
        phone: isArabic ? 'الهاتف' : 'Tél',
        seller: isArabic ? 'البائع' : 'Vendeur',
        payment: isArabic ? 'طريقة الدفع' : 'Mode de paiement',
        product: isArabic ? 'المنتج' : 'Désignation',
        qty: isArabic ? 'الكمية' : 'Qté',
        unitPrice: isArabic ? 'السعر' : 'P.U',
        discount: isArabic ? 'الخصم' : 'Remise',
        total: isArabic ? 'المجموع' : 'Total',
        subtotal: isArabic ? 'المجموع الفرعي' : 'Sous-total',
        tax: isArabic ? 'الضريبة' : 'Taxe',
        totalAmount: isArabic ? 'المجموع الكلي' : 'Total à payer',
        amountInWords: isArabic ? 'المبلغ بالحروف' : 'Arrêtée la présente facture à la somme de',
        anonymous: isArabic ? 'زبون مجهول' : 'Client comptoir',
        thanks: isArabic ? 'شكرا لتسوقكم!' : 'Merci pour votre confiance !',
        nif: 'NIF',
        rc: 'RC',
    };

    return (
        <div 
            ref={ref}
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                backgroundColor: 'white',
                color: 'black',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                lineHeight: '1.4',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#1976d2', fontWeight: 'bold' }}>
                        {storeSettings?.store_name || 'Quincaillerie'}
                    </h1>
                    {storeSettings?.owner_name && (
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>{storeSettings.owner_name}</p>
                    )}
                    {storeSettings?.address && (
                        <p style={{ margin: '3px 0', fontSize: '11px', color: '#555' }}>{storeSettings.address}</p>
                    )}
                    {storeSettings?.phone && (
                        <p style={{ margin: '3px 0', fontSize: '11px', color: '#555' }}>{labels.phone}: {storeSettings.phone}</p>
                    )}
                    {storeSettings?.tax_id && (
                        <p style={{ margin: '3px 0', fontSize: '11px', color: '#555' }}>{labels.nif}: {storeSettings.tax_id}</p>
                    )}
                    {storeSettings?.rc_number && (
                        <p style={{ margin: '3px 0', fontSize: '11px', color: '#555' }}>{labels.rc}: {storeSettings.rc_number}</p>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{labels.invoice}</h2>
                    <p style={{ margin: '5px 0', fontSize: '16px', color: '#1976d2', fontWeight: 'bold' }}>{bill.bill_number}</p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#555' }}>{labels.date}: {formatDate(bill.created_at)}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                <div>
                    <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#777', textTransform: 'uppercase' }}>{labels.client}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{bill.customer_name || labels.anonymous}</p>
                    {bill.customer_phone && <p style={{ margin: '3px 0 0 0', fontSize: '12px' }}>{bill.customer_phone}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 3px 0', fontSize: '10px', color: '#777', textTransform: 'uppercase' }}>{labels.seller}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{bill.worker?.name || '-'}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px' }}>{labels.payment}: {paymentMethods[bill.payment_method]}</p>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>{labels.product}</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', width: '60px' }}>{labels.qty}</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', width: '100px' }}>{labels.unitPrice}</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', width: '80px' }}>{labels.discount}</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', width: '110px' }}>{labels.total}</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items?.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td style={{ padding: '8px 10px' }}>
                                <span style={{ fontWeight: '500' }}>{item.product_name}</span>
                                {item.product_sku && (
                                    <span style={{ display: 'block', fontSize: '10px', color: '#777' }}>SKU: {item.product_sku}</span>
                                )}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: item.discount > 0 ? '#c62828' : '#999' }}>
                                {item.discount > 0 ? '-' + formatCurrency(item.discount) : '-'}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                        <span>{labels.subtotal}:</span>
                        <span>{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee', color: '#c62828' }}>
                            <span>{labels.discount}:</span>
                            <span>-{formatCurrency(bill.discount)}</span>
                        </div>
                    )}
                    {bill.tax > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                            <span>{labels.tax}:</span>
                            <span>{formatCurrency(bill.tax)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #333', fontSize: '16px', fontWeight: 'bold' }}>
                        <span>{labels.totalAmount}:</span>
                        <span style={{ color: '#1976d2' }}>{formatCurrency(bill.total)}</span>
                    </div>
                </div>
            </div>

            {/* Amount in Words */}
            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <p style={{ margin: 0, fontSize: '11px' }}>
                    <strong>{labels.amountInWords}:</strong><br />
                    <span style={{ fontStyle: 'italic', fontSize: '13px' }}>{totalInWords}</span>
                </p>
            </div>

            {/* Notes */}
            {bill.notes && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff9e6', borderRadius: '5px', border: '1px solid #ffe0b2' }}>
                    <p style={{ margin: 0, fontSize: '11px' }}>
                        <strong>Notes:</strong> {bill.notes}
                    </p>
                </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                    {storeSettings?.invoice_footer || labels.thanks}
                </p>
            </div>
        </div>
    );
});

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
