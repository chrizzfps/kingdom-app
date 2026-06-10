import type { ModuleType } from '@/types/proposal';
import { DEFAULT_MODULE_DATA } from '@/types/proposal';

export const TEMPLATES: Record<ModuleType, Array<{ name: string; data: any }>> = {
  HERO: [
    { name: 'Clásico', data: DEFAULT_MODULE_DATA.HERO },
    { name: 'Impacto', data: { title: 'Tu salto al siguiente nivel', subtitle: 'Plan de ejecución y resultados', backgroundGradient: { colors: ['#0054df', '#33ccff'], angle: 45, animate: true }, overlay: 20, align: 'center' } },
  ],
  INTRO: [{ name: 'Brief', data: DEFAULT_MODULE_DATA.INTRO }],
  OPTIONS: [{ name: 'Opciones básicas', data: DEFAULT_MODULE_DATA.OPTIONS }],
  PRICING: [{ name: 'Tabla simple', data: DEFAULT_MODULE_DATA.PRICING }],
  TIMELINE: [{ name: 'Semanas', data: DEFAULT_MODULE_DATA.TIMELINE }],
  PAYMENT: [{ name: 'Términos estándar', data: DEFAULT_MODULE_DATA.PAYMENT }],
  CTA: [{ name: 'Contacto', data: DEFAULT_MODULE_DATA.CTA }],
  TEXT: [{ name: 'Texto libre', data: DEFAULT_MODULE_DATA.TEXT }],
  REFERENCES: [{ name: 'Grid de referencias', data: DEFAULT_MODULE_DATA.REFERENCES }],
  PROJECT: [{ name: 'Grid de Proyectos', data: DEFAULT_MODULE_DATA.PROJECT }],
  PORTFOLIO_HERO: [{ name: 'Portada Portafolio', data: DEFAULT_MODULE_DATA.PORTFOLIO_HERO }],
  PORTFOLIO_CTA: [{ name: 'CTA Portafolio', data: DEFAULT_MODULE_DATA.PORTFOLIO_CTA }],
  WHITEBOARD: [{ name: 'Pizarra', data: DEFAULT_MODULE_DATA.WHITEBOARD }],
};
