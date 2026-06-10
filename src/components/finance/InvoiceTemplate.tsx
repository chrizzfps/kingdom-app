import React from 'react';
import type { Invoice, Client, AgencySettings } from '@/types/crm';

interface InvoiceTemplateProps {
    invoice: Invoice;
    client?: Client;
    settings?: AgencySettings;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice, client, settings }, ref) => {
    // Helper to format currency
    const formatCurrency = (amount: number) => {
        if (!amount && amount !== 0) return '0,00 €';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: invoice.currency || 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Helper to format date
    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const subtotal = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
    const discount = invoice.discount || 0;
    const taxableBase = Math.max(0, subtotal - discount);
    const taxAmount = taxableBase * ((invoice.taxRate || 0) / 100);
    const total = taxableBase + taxAmount;

    return (
        <div
            ref={ref}
            className="bg-white text-black max-w-[210mm] mx-auto min-h-[297mm] relative overflow-hidden"
            style={{
                fontFamily: 'Montserrat, system-ui, sans-serif', // Matching typical backend font if known, else system
                color: '#000000',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Background Images */}
            {settings?.headerBgUrl && (
                <div className="absolute top-0 left-0 w-full h-[200px] z-0 overflow-hidden">
                    <img src={settings.headerBgUrl} className="w-full h-full object-cover" alt="" />
                </div>
            )}
            {settings?.footerBgUrl && (
                <div className="absolute bottom-0 left-0 w-full h-[150px] z-0 overflow-hidden">
                    <img src={settings.footerBgUrl} className="w-full h-full object-cover opacity-90" alt="" />
                </div>
            )}
            {settings?.isotypeUrl && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-5 pointer-events-none">
                    <img src={settings.isotypeUrl} className="w-[500px]" alt="" />
                </div>
            )}

            <div className="relative z-10 p-12 pt-16">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                        {settings?.logoUrl && (
                            <img
                                src={settings.logoUrl}
                                alt={settings.name || 'Logo'}
                                className="h-20 mb-4 object-contain"
                            />
                        )}
                        <h2 className="font-bold text-xl leading-tight text-gray-900">
                            {settings?.commercialName || settings?.name}
                        </h2>
                        <div className="text-xs text-gray-600 space-y-1 mt-2">
                            {settings?.address && <p>{settings.address}</p>}
                            {settings?.email && <p>{settings.email}</p>}
                            {settings?.phone && <p>{settings.phone}</p>}
                            {settings?.taxId && <p className="font-medium">NIF/CIF: {settings.taxId}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-6xl font-black tracking-tight text-gray-900/10 absolute top-10 right-10 -z-10">
                            FACTURA
                        </h1>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Factura Nº</p>
                            <p className="text-2xl font-bold text-gray-900">{invoice.number || '000000'}</p>
                        </div>
                    </div>
                </div>

                {/* Client & Dates Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Facturar a</h3>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <p className="font-bold text-lg text-gray-900 mb-2">
                                {client?.commercialName || client?.name || 'Cliente'}
                            </p>
                            {client?.address && (
                                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                    {client.address}
                                </p>
                            )}
                            <div className="text-sm text-gray-500 space-y-1">
                                {client?.email && <p>{client.email}</p>}
                                {client?.taxId && <p className="font-medium">CIF: {client.taxId}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                            <span className="text-sm font-medium text-gray-500">Fecha de Emisión</span>
                            <span className="text-base font-semibold text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                            <span className="text-sm font-medium text-gray-500">Vencimiento</span>
                            <span className="text-base font-semibold text-gray-900">{formatDate(invoice.dueDate)}</span>
                        </div>
                        {invoice.status && (
                            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium text-gray-500">Estado</span>
                                <span className="text-sm font-bold uppercase text-gray-900">{invoice.status}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-4 pl-2 font-bold text-xs uppercase tracking-wider text-gray-900">Descripción</th>
                                <th className="text-center py-4 px-2 font-bold text-xs uppercase tracking-wider text-gray-900 w-[100px]">Cant.</th>
                                <th className="text-right py-4 px-2 font-bold text-xs uppercase tracking-wider text-gray-900 w-[130px]">Precio</th>
                                <th className="text-right py-4 pr-2 font-bold text-xs uppercase tracking-wider text-gray-900 w-[130px]">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <tr key={item.id || index} className="group">
                                        <td className="py-4 pl-2 text-sm font-medium text-gray-900 group-hover:bg-primary/5 transition-colors rounded-l-md">
                                            {item.description || 'Concepto'}
                                        </td>
                                        <td className="py-4 px-2 text-center text-sm text-gray-600 group-hover:bg-primary/5 transition-colors">
                                            {item.quantity || 1}
                                        </td>
                                        <td className="py-4 px-2 text-right text-sm text-gray-600 group-hover:bg-primary/5 transition-colors">
                                            {formatCurrency(item.price || 0)}
                                        </td>
                                        <td className="py-4 pr-2 text-right text-sm font-bold text-gray-900 group-hover:bg-primary/5 transition-colors rounded-r-md">
                                            {formatCurrency((item.quantity || 1) * (item.price || 0))}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm italic">
                                        Agrega conceptos a la factura...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-[380px] space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-medium">Descuento</span>
                                <span className="font-semibold">-{formatCurrency(discount)}</span>
                            </div>
                        )}
                        {invoice.taxRate && invoice.taxRate > 0 ? (
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-600">Impuestos ({invoice.taxRate}%)</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(taxAmount)}</span>
                            </div>
                        ) : null}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                            <span className="font-bold text-lg text-gray-900">TOTAL</span>
                            <span className="font-black text-2xl text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {(invoice.notes || settings?.invoiceTerms) && (
                <div className="pt-8 border-t border-gray-300 mt-10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Notas y Términos</h3>
                    {invoice.notes && (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                            {invoice.notes}
                        </p>
                    )}
                    {settings?.invoiceTerms && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                            {settings.invoiceTerms}
                        </p>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-16 pt-6 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                    {settings?.invoiceTerms || 'Gracias por confiar en nosotros. Esta factura es válida para efectos fiscales.'}
                </p>
                {settings?.website && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                        {settings.website}
                    </p>
                )}
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
