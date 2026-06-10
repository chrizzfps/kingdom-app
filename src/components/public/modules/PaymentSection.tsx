import { motion, AnimatePresence } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { Copy, CreditCard, Calendar, Wallet, Send, Bitcoin, Smartphone, Landmark, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getGlobalPaymentMethods, type GlobalPaymentMethod } from '@/api/settings';

const MethodIcon = ({ type, className }: { type: string; className?: string }) => {
    switch (type) {
        case 'BANK':     return <Landmark className={className} />;
        case 'PAYPAL':   return <Wallet className={className} />;
        case 'BITCOIN':  return <Bitcoin className={className} />;
        case 'BINANCE':  return <Smartphone className={className} />;
        case 'ZELLE':    return <Send className={className} />;
        case 'ZINLI':    return <Send className={className} />;
        case 'BOLIVARES': return <CreditCard className={className} />;
        default:         return <CreditCard className={className} />;
    }
};

const MethodCard = ({ method, compact = false }: { method: GlobalPaymentMethod; compact?: boolean }) => {
    const details = method.details || {};
    const type = method.type;
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyAll = () => {
        let allText = `Método: ${type}\n`;
        if (type === 'BANK' || type === 'BOLIVARES') {
            if (details.bankName)      allText += `Banco: ${details.bankName}\n`;
            if (details.holderName)    allText += `Titular: ${details.holderName}\n`;
            if (details.idNumber)      allText += `${type === 'BOLIVARES' ? 'Cédula/RIF' : 'ID'}: ${details.idNumber}\n`;
            if (details.accountNumber) allText += `Cuenta: ${details.accountNumber}\n`;
            if (details.swift)         allText += `${type === 'BOLIVARES' ? 'Pago Móvil' : 'SWIFT'}: ${details.swift}\n`;
        } else if (type === 'PAYPAL') {
            if (details.email)      allText += `Email: ${details.email}\n`;
            if (details.holderName) allText += `Titular: ${details.holderName}\n`;
        } else if (type === 'BITCOIN' || type === 'BINANCE') {
            if (details.wallet)   allText += `Wallet/ID: ${details.wallet}\n`;
            if (details.network)  allText += `Red: ${details.network}\n`;
            if (details.currency) allText += `Moneda: ${details.currency}\n`;
        } else {
            if (details.email)      allText += `Email/Telf: ${details.email}\n`;
            if (details.holderName) allText += `Titular: ${details.holderName}\n`;
        }
        navigator.clipboard.writeText(allText);
        setCopiedField('ALL');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getDetailRows = () => {
        const rows: { label: string; value?: string }[] = [];
        if (type === 'BANK' || type === 'BOLIVARES') {
            rows.push(
                { label: 'Banco', value: details.bankName },
                { label: 'Titular', value: details.holderName },
                { label: 'Cuenta', value: details.accountNumber },
                { label: type === 'BOLIVARES' ? 'Cédula / RIF' : 'ID', value: details.idNumber },
                { label: type === 'BOLIVARES' ? 'Pago Móvil' : 'SWIFT / BIC', value: details.swift },
            );
        } else if (type === 'PAYPAL') {
            rows.push(
                { label: 'Correo PayPal', value: details.email },
                { label: 'Titular', value: details.holderName },
                { label: 'Código de botón', value: details.buttonCode },
            );
        } else if (type === 'BITCOIN' || type === 'BINANCE') {
            rows.push(
                { label: type === 'BINANCE' ? 'Binance ID / Email' : 'Wallet', value: details.wallet },
                { label: 'Red', value: details.network },
                { label: 'Moneda', value: details.currency },
            );
        } else {
            rows.push(
                { label: 'Correo / Teléfono', value: details.email },
                { label: 'Titular', value: details.holderName },
            );
        }
        return rows.filter(r => !!r.value && String(r.value).trim().length > 0);
    };

    const detailRows = getDetailRows();

    return (
        <motion.div
            key={method.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'bg-black text-white rounded-2xl sm:rounded-3xl w-full shadow-2xl relative overflow-hidden flex flex-col',
                compact ? 'p-4 h-[198px]' : 'p-6 sm:p-7 h-[312px] max-w-[560px]',
            )}
        >
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <MethodIcon type={type} className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <span className="text-xs sm:text-sm font-medium tracking-widest uppercase opacity-80">{type}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAll}
                    className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 rounded-full hover:bg-white/10 text-white/60 hover:text-white border border-white/10"
                >
                    {copiedField === 'ALL' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedField === 'ALL' ? 'Copiado' : 'Copiar'}
                </Button>
            </div>

            <div className={cn(
                'relative z-10 grid flex-1 content-start py-3',
                compact
                    ? 'grid-cols-1 gap-y-2.5'
                    : detailRows.length >= 4
                        ? 'grid-cols-2 gap-x-4 gap-y-3'
                        : 'grid-cols-1 gap-y-3.5',
            )}>
                {detailRows.length > 0 ? (
                    detailRows.map((row, idx) => (
                        <button
                            key={`${row.label}-${idx}`}
                            type="button"
                            onClick={() => copyToClipboard(String(row.value), row.label)}
                            className={cn(
                                'w-full text-left group',
                                row.label.toLowerCase().includes('codigo') && !compact ? 'col-span-2' : '',
                            )}
                        >
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">{row.label}</p>
                            <p className={cn(
                                'font-medium text-zinc-100 group-hover:text-white transition-colors break-words',
                                compact ? 'text-xs sm:text-sm leading-snug' : 'text-xs sm:text-sm leading-snug',
                                row.label.toLowerCase().includes('wallet') || row.label.toLowerCase().includes('codigo')
                                    ? 'font-mono text-[10px] sm:text-[11px]'
                                    : '',
                            )}>
                                {String(row.value)}
                            </p>
                        </button>
                    ))
                ) : (
                    <p className="text-xs text-zinc-500 italic">Sin detalles configurados.</p>
                )}
            </div>

            <div className="relative z-10 flex gap-2 pt-1.5 shrink-0">
                {details.currency && (
                    <span className="px-2 py-0.5 sm:py-1 rounded-md bg-white/10 text-[9px] sm:text-[10px] font-bold tracking-wide">{details.currency}</span>
                )}
                {details.network && (
                    <span className="px-2 py-0.5 sm:py-1 rounded-md bg-white/10 text-[9px] sm:text-[10px] font-bold tracking-wide">{details.network}</span>
                )}
            </div>
        </motion.div>
    );
};

export function PaymentSection({ module }: { module: ProposalModule }) {
    const { terms, milestones = [] } = module.data;
    const [globalMethods, setGlobalMethods] = useState<GlobalPaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

    useEffect(() => {
        getGlobalPaymentMethods().then(methods => {
            setGlobalMethods(methods);
            if (methods.length > 0) setSelectedMethodId(methods[0].id);
        }).catch(() => {});
    }, []);

    const currentMethod = globalMethods.find(m => m.id === selectedMethodId);

    return (
        <section className="min-h-[100dvh] flex flex-col justify-center bg-zinc-950 text-white snap-start">
            <div className="max-w-6xl w-full h-full mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 flex flex-col min-h-0">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-4 sm:mb-6 md:mb-8 text-center md:text-left shrink-0"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-1 sm:mb-2">Métodos de Pago</h2>
                    <p className="text-zinc-400 text-xs sm:text-sm md:text-base lg:text-lg">Detalles para realizar tu inversión de forma segura.</p>
                </motion.div>

                {globalMethods.length > 0 && (
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 mb-4 sm:mb-5 md:mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 shrink-0">
                        {globalMethods.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMethodId(m.id)}
                                className={cn(
                                    'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap shrink-0',
                                    selectedMethodId === m.id
                                        ? 'border-white bg-white text-zinc-950 shadow-sm ring-1 ring-white/40'
                                        : 'border-transparent bg-white/5 text-zinc-400 hover:bg-white/10',
                                )}
                            >
                                <MethodIcon type={m.type} className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="uppercase tracking-wide">{m.type}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-start content-start flex-1 min-h-0">

                    <div className="flex justify-center lg:justify-start items-start self-start min-h-0">
                        <AnimatePresence mode="wait">
                            {currentMethod ? (
                                <>
                                    <div className="sm:hidden w-full min-h-0">
                                        <MethodCard key={currentMethod.id + '-mobile'} method={currentMethod} compact={true} />
                                    </div>
                                    <div className="hidden sm:block min-h-0 w-full">
                                        <MethodCard key={currentMethod.id} method={currentMethod} />
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 sm:p-12 border border-dashed rounded-2xl sm:rounded-3xl text-zinc-600 text-sm">
                                    Sin métodos de pago configurados.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm min-h-0">
                        <h3 className="flex items-center gap-2 text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-6 text-white">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            Cronograma de Pagos
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            {(milestones || []).length > 0 ? milestones.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                        <div className={cn(
                                            'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border transition-colors shrink-0',
                                            i === 0 ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-700',
                                        )}>
                                            {i + 1}
                                        </div>
                                        <span className="font-medium sm:font-semibold text-zinc-100 text-xs sm:text-sm md:text-base truncate">{item.label}</span>
                                    </div>
                                    <span className={cn(
                                        'font-bold tabular-nums px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs md:text-sm shrink-0',
                                        i === 0 ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-300',
                                    )}>
                                        {item.amount || item.percentage}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-zinc-500 italic text-xs sm:text-sm">Consulta los hitos en tu contrato.</p>
                            )}
                        </div>
                    </div>

                    {terms ? (
                        <div className="bg-zinc-900 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm min-h-0 lg:col-span-2">
                            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-4 text-white">Términos Generales</h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line break-words">{terms}</p>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/60 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 min-h-0 flex items-center justify-center lg:col-span-2">
                            <p className="text-xs sm:text-sm text-zinc-500 italic">Sin términos configurados.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
