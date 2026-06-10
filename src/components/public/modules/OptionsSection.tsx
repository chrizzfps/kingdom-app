import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ProposalModule } from '@/types/proposal';
import { MotionSection } from '../common/MotionSection';
import { AnimatedTitle } from '../common/AnimatedTitle';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OptionsSection({ module }: { module: ProposalModule }) {
  const options = module.data.options || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalOptions = options.length;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + totalOptions) % totalOptions);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalOptions);
  };

  const currentOption = options[currentIndex];

  return (
    <MotionSection className="py-10 md:py-14 bg-zinc-950 text-white relative overflow-hidden snap-start" minH="min-h-[100dvh]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-700/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl w-full h-full mx-auto px-4 sm:px-6 md:px-12 relative z-10 flex flex-col min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-10 shrink-0"
        >
          <AnimatedTitle text="Opciones Disponibles" className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-3 md:mb-4" />
          <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Analiza las soluciones diseñadas para alcanzar tus objetivos.
          </p>
        </motion.div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          {totalOptions > 0 && currentOption && (
            <div className="space-y-4">
              <motion.div
                key={currentOption.id || currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OptionCard option={currentOption} isPopular={currentOption.isPopular} module={module} />
              </motion.div>

              {/* Mobile Navigation */}
              {totalOptions > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    className="text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {options.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex
                            ? 'bg-white w-4'
                            : 'bg-zinc-600 hover:bg-zinc-500'
                          }`}
                        aria-label={`Ir a opción ${i + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className={`hidden md:grid gap-6 flex-1 min-h-0 ${totalOptions === 1 ? 'max-w-xl mx-auto' :
            totalOptions === 2 ? 'md:grid-cols-2' :
              'md:grid-cols-2 lg:grid-cols-3'
          }`}>
          {options.map((opt: any, index: number) => (
            <motion.div
              key={opt.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <OptionCard option={opt} isPopular={opt.isPopular} module={module} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {totalOptions === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p>No hay opciones configuradas.</p>
          </div>
        )}
      </div>
    </MotionSection>
  );
}

// Extracted Card Component for reuse
function OptionCard({ option, isPopular, module }: { option: any; isPopular?: boolean; module: ProposalModule }) {
  return (
    <div className={`
            h-full min-h-0 relative bg-zinc-900/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8
            border transition-all duration-300
            ${isPopular
        ? 'border-white/30 bg-zinc-900'
        : 'border-white/15 hover:border-white/30'
      }
        `}>
      {isPopular && (
        <div className="inline-block mb-2.5 text-[10px] uppercase tracking-[0.16em] text-zinc-300 border border-white/20 rounded-full px-2 py-1">
          Destacada
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4 tracking-tight leading-tight">
        {option.title}
      </h3>

      {/* Description */}
      <p className="text-zinc-300/90 text-sm leading-relaxed mb-5 md:mb-6 max-h-[5.5rem] overflow-hidden">
        {option.description}
      </p>

      {/* Advantage Highlight Box */}
      {option.advantage && (
        <div className="mb-6 md:mb-8 p-3 sm:p-4 rounded-lg border border-white/10 bg-black/30">
          <p className="text-white/90 text-sm leading-relaxed max-h-[5.5rem] overflow-hidden">
            {option.advantage}
          </p>
        </div>
      )}

      {/* Core Services List */}
      {(option.coreServices && option.coreServices.length > 0) && (
        <div className="space-y-2.5 sm:space-y-3 overflow-y-auto pr-1 min-h-0">
          {option.coreServices.map((service: string, sIdx: number) => (
            <div
              key={sIdx}
              className="flex items-start gap-2.5 sm:gap-3 text-sm"
            >
              <Check className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{service}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legacy support for old features array */}
      {(!option.coreServices || option.coreServices.length === 0) && option.features && (
        <div className="space-y-2.5 sm:space-y-3 overflow-y-auto pr-1 min-h-0">
          {(module.data.features || [])
            .filter((f: any) => (option.features || []).includes(typeof f === 'string' ? f : f.id))
            .map((feat: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 sm:gap-3 text-sm">
                <Check className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                <span className="text-zinc-300">{typeof feat === 'string' ? feat : feat.name}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
