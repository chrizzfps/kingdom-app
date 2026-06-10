import { motion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { useMemo, useRef, useState } from 'react';
import { MotionSection } from '../common/MotionSection';
import { Logo } from '@/components/shared/Logo';
import { Calendar, MapPin, Briefcase, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PricingProps {
  module: ProposalModule;
  allModules?: ProposalModule[];
}

export function PricingSection({ module, allModules }: PricingProps) {
  const { title, clientLocation, clientType, validUntil } = module.data || {};
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);

  // 1. Find Options Module (for option titles/metadata only)
  const optionsModule = useMemo(() => {
    return allModules?.find(m => m.type === 'OPTIONS');
  }, [allModules]);

  // 2. Get Items and Allocations from PRICING module (this module)
  const pricingData = module.data || {};
  const globalItems = pricingData.globalItems || [];
  const allocations = pricingData.allocations || {};

  // 3. Extract current option data
  const { currentOption, featuresList, totalOptions } = useMemo(() => {
    if (!optionsModule?.data) return { currentOption: null, featuresList: [], totalOptions: 0 };

    const options = optionsModule.data.options || [];

    if (options.length === 0) return { currentOption: null, featuresList: [], totalOptions: 0 };

    // Ensure index is within bounds (safety check)
    const index = currentOptionIndex % options.length;
    const selected = options[index];

    // Get allocated item IDs for this option from PRICING allocations
    const allocatedItemIds = allocations[selected.id] || [];

    // Map items for this option
    const includedFeatures = allocatedItemIds.map((itemId: string) => {
      const item = globalItems.find((i: any) => i.id === itemId);
      return item ? { ...item, price: Number(item.price || 0) } : null;
    }).filter(Boolean);

    return {
      currentOption: selected,
      featuresList: includedFeatures,
      totalOptions: options.length
    };
  }, [optionsModule, currentOptionIndex, globalItems, allocations]);

  // Calculate Total
  const total = featuresList.reduce((sum: number, item: any) => sum + item.price, 0);

  const handlePrev = () => {
    setCurrentOptionIndex(prev => (prev - 1 + totalOptions) % totalOptions);
  };

  const handleNext = () => {
    setCurrentOptionIndex(prev => (prev + 1) % totalOptions);
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsGeneratingPdf(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
      const element = cardRef.current;

      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`Cotizacion-${currentOption?.title || 'Final'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intente de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!currentOption) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400">
        <p>Configura las opciones en el módulo anterior para ver la cotización.</p>
      </div>
    );
  }

  return (
    <MotionSection className="min-h-[100dvh] flex flex-col justify-center py-2 sm:py-4 md:py-8 bg-zinc-50 text-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 relative z-10 flex flex-col justify-center items-center">

        <div className="flex items-center w-full gap-4 md:gap-8">
          {/* Left Arrow */}
          {totalOptions > 1 && (
            <button
              onClick={handlePrev}
              className="hidden md:flex p-2 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label="Opción anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <motion.div
            key={currentOption.id} // Re-animate on option change
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow relative bg-white rounded-lg shadow-2xl overflow-hidden border border-zinc-200/60 w-full"
          >
            <div ref={cardRef} style={{ backgroundColor: '#ffffff' }}>
              <div style={{ height: '6px', width: '100%', backgroundColor: '#18181b' }} />

              <div className="p-3 sm:p-5 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 pb-3" style={{ borderBottom: '1px solid #f4f4f5' }}>
                  <div className="space-y-2 w-full sm:w-auto">
                    <Logo mode="dark" className="h-4 sm:h-5 md:h-7 w-auto" />
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold font-sans tracking-tight leading-tight" style={{ color: '#09090b' }}>
                        {title || 'Presupuesto de Servicios'}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base mt-0.5 font-medium" style={{ color: '#52525b' }}>
                        ({currentOption.title})
                      </p>
                      <p className="text-[9px] sm:text-[10px] mt-1 uppercase tracking-widest font-semibold" style={{ color: '#a1a1aa' }}>
                        Cotización Oficial
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1.5 w-full sm:w-auto sm:min-w-[180px]">
                    {clientType && (
                      <div className="flex items-center sm:justify-end gap-2 text-xs sm:text-sm" style={{ color: '#52525b' }}>
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#a1a1aa' }} />
                        <span>{clientType}</span>
                      </div>
                    )}
                    {clientLocation && (
                      <div className="flex items-center sm:justify-end gap-2 text-xs sm:text-sm" style={{ color: '#52525b' }}>
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#a1a1aa' }} />
                        <span>{clientLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center sm:justify-end gap-2 text-xs sm:text-sm" style={{ color: '#52525b' }}>
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#a1a1aa' }} />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Items List (From Options) */}
                <div className="mb-4 sm:mb-6">
                  <div className="hidden sm:grid grid-cols-12 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 px-2" style={{ color: '#a1a1aa' }}>
                    <div className="col-span-8">Servicio</div>
                    <div className="col-span-4 text-right">Valor</div>
                  </div>

                  <div className="space-y-0.5">
                    {featuresList.length === 0 ? (
                      <div className="py-4 text-center italic text-xs" style={{ color: '#a1a1aa' }}>Esta opción no tiene costos asociados visibles.</div>
                    ) : (
                      featuresList.map((item: any, index: number) => (
                        <div key={index}
                          className="flex flex-col sm:grid sm:grid-cols-12 py-1 sm:py-1.5 px-2 sm:px-3 rounded-sm transition-colors"
                          style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'transparent' }}
                        >
                          <div className="col-span-8 pr-1 mb-0.5 sm:mb-0 font-medium text-xs sm:text-sm" style={{ color: '#27272a' }}>
                            {item.name}
                          </div>
                          <div className="col-span-4 text-left sm:text-right text-xs sm:text-sm font-mono font-medium" style={{ color: '#18181b' }}>
                            ${item.price.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 sm:pt-4 flex justify-end" style={{ borderTop: '2px solid #18181b' }}>
                  <div className="text-right">
                    <span className="block text-[9px] sm:text-[10px] font-medium uppercase tracking-widest mb-0.5" style={{ color: '#71717a' }}>Total</span>
                    <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight font-sans" style={{ color: '#18181b' }}>
                      ${total.toLocaleString()}
                    </span>
                    {validUntil && <p className="text-[9px] sm:text-[10px] mt-0.5 italic" style={{ color: '#a1a1aa' }}>* {validUntil}</p>}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 md:mt-6 text-center pt-2 sm:pt-3" style={{ borderTop: '1px solid #f4f4f5' }}>
                  <p className="text-[9px] sm:text-[10px] leading-relaxed" style={{ color: '#a1a1aa' }}>
                    Opción: <strong style={{ color: '#27272a' }}>{currentOption.title}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-2 sm:p-3 md:p-4 border-t border-zinc-200 text-center flex flex-col md:flex-row justify-center items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-4 md:hidden w-full justify-between px-4">
                {/* Mobile Arrows */}
                <Button variant="ghost" size="icon" onClick={handlePrev} disabled={totalOptions <= 1}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-xs text-zinc-500 font-medium">
                  Opción {currentOptionIndex + 1} de {totalOptions}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={totalOptions <= 1}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="contrast"
                size="sm"
                className="w-full md:w-auto border border-zinc-900 bg-zinc-900 text-white hover:bg-black transition-all gap-2 font-medium h-9 text-xs"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {isGeneratingPdf ? 'Generando PDF...' : 'Descargar Cotización (PDF)'}
              </Button>
            </div>
          </motion.div>

          {/* Right Arrow */}
          {totalOptions > 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex p-2 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label="Siguiente opción"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Pagination Dots (Optional Visual Indicator) */}
        {totalOptions > 1 && (
          <div className="flex gap-2 mt-6">
            {Array.from({ length: totalOptions }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentOptionIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentOptionIndex ? 'bg-zinc-900 w-4' : 'bg-zinc-300 hover:bg-zinc-400'}`}
                aria-label={`Ir a opción ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </MotionSection>
  );
}
