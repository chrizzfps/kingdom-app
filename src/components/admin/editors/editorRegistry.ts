import type { ComponentType } from 'react';
import type { ModuleType } from '@/types/proposal';
import { HeroEditor } from './HeroEditor';
import { IntroEditor } from './IntroEditor';
import { OptionsEditor } from './OptionsEditor';
import { CTAEditor } from './CTAEditor';
import { PaymentEditor } from './PaymentEditor';
import { TimelineEditor } from './TimelineEditor';
import { PricingEditor } from './PricingEditor';
import { TextEditor } from './TextEditor';
import { ReferencesEditor } from './ReferencesEditor';
import { ProjectEditor } from './ProjectEditor';
import { PortfolioHeroEditor } from './PortfolioHeroEditor';
import { PortfolioCTAEditor } from './PortfolioCTAEditor';

// WHITEBOARD is excluded — it has its own full-screen portal in ProposalBuilder.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EDITOR_REGISTRY: Partial<Record<ModuleType, ComponentType<any>>> = {
    HERO: HeroEditor,
    INTRO: IntroEditor,
    OPTIONS: OptionsEditor,
    CTA: CTAEditor,
    PAYMENT: PaymentEditor,
    TIMELINE: TimelineEditor,
    PRICING: PricingEditor,
    TEXT: TextEditor,
    REFERENCES: ReferencesEditor,
    PROJECT: ProjectEditor,
    PORTFOLIO_HERO: PortfolioHeroEditor,
    PORTFOLIO_CTA: PortfolioCTAEditor,
};
