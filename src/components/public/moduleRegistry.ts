import type { ComponentType } from 'react';
import type { ModuleType } from '@/types/proposal';
import { HeroSection } from './modules/HeroSection';
import { IntroSection } from './modules/IntroSection';
import { OptionsSection } from './modules/OptionsSection';
import { TimelineSection } from './modules/TimelineSection';
import { PricingSection } from './modules/PricingSection';
import { PaymentSection } from './modules/PaymentSection';
import { CTASection } from './modules/CTASection';
import { TextSection } from './modules/TextSection';
import { ReferencesSection } from './modules/ReferencesSection';
import { ProjectSection } from './modules/ProjectSection';
import { PortfolioHeroSection } from './modules/PortfolioHeroSection';
import { PortfolioCTASection } from './modules/PortfolioCTASection';
import { WhiteboardSection } from './modules/WhiteboardSection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUBLIC_MODULE_REGISTRY: Record<ModuleType, ComponentType<any>> = {
    HERO: HeroSection,
    INTRO: IntroSection,
    OPTIONS: OptionsSection,
    TIMELINE: TimelineSection,
    PRICING: PricingSection,
    PAYMENT: PaymentSection,
    CTA: CTASection,
    TEXT: TextSection,
    REFERENCES: ReferencesSection,
    PROJECT: ProjectSection,
    PORTFOLIO_HERO: PortfolioHeroSection,
    PORTFOLIO_CTA: PortfolioCTASection,
    WHITEBOARD: WhiteboardSection,
};
