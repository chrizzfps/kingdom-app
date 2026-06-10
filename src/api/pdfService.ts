import type { Invoice } from '@/types/crm';

const API_URL = import.meta.env.VITE_PDF_API_URL || 'https://app.kingdomagency.es';


export const PdfService = {
    async generateInvoicePdf(invoice: Invoice, settings: any, client: any): Promise<Blob> {
        const payload = {
            invoice: {
                uuid: invoice.id,
                invoice_number: invoice.number,
                created_at: invoice.date, // Assumes date string or Date object
                due_date: invoice.dueDate,
            },
            company: {
                name: settings?.commercialName || settings?.name || 'Kingdom Agency',
                email: settings?.email,
                phone: settings?.phone,
                address: settings?.address,
                logotype_url: settings?.logoUrl || invoice.logoUrl,
                isotype_url: settings?.isotypeUrl,
                tax_id: settings?.taxId,
                terms: settings?.termsAndConditions || settings?.invoiceTerms,
            },
            branding: {
                header_bg_url: settings?.headerBgUrl || invoice.headerBgUrl,
                footer_bg_url: settings?.footerBgUrl || invoice.footerBgUrl,
            },
            customer: {
                name: client.legalName || client.name || 'Cliente',
                email: client.email,
                phone: client.phone,
                address: client.fiscalAddress || client.address,
                tax_id: client.taxId,
            },
            items: invoice.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.price,
            })),
            totals: {
                subtotal: invoice.subtotal,
                discount: invoice.discount || 0,
                tax_rate: invoice.taxRate,
                tax: invoice.taxAmount,
                total: invoice.total,
            },
            currency_symbol: invoice.currency === 'USD' ? '$' : '€', // Simple logic, enhance if needed
        };

        try {
            const response = await fetch(`${API_URL}/api/invoices/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error generico' }));
                throw new Error(errorData.message || 'Error al generar PDF');
            }

            return await response.blob();
        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw error;
        }
    },

    downloadBlob(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
