import { useFormContext } from 'react-hook-form';
import { InvoiceTemplate } from '@/components/finance/InvoiceTemplate';
import type { Client, AgencySettings, Invoice } from '@/types/crm';

interface InvoicePreviewProps {
    clients: Client[];
    settings: AgencySettings | null;
}

export function InvoicePreview({ clients, settings }: InvoicePreviewProps) {
    const { watch } = useFormContext<Invoice>();
    const formData = watch();
    const selectedClientId = watch('clientId');
    const client = clients.find(c => c.id === selectedClientId);

    return (
        <div className="bg-white text-black min-h-[297mm] w-[210mm] shadow-sm select-none pointer-events-none">
            {/* Pointer events none to prevent interaction with the preview forms/inputs if any */}
            <InvoiceTemplate
                invoice={formData}
                client={client}
                settings={settings || undefined}
            />
        </div>
    );
}
