import type { ProposalModule } from '@/types/proposal';
import { PremiumGallery } from '../common/PremiumGallery';
import { MotionSection } from '../common/MotionSection';
import { AnimatedTitle } from '../common/AnimatedTitle';

export function ReferencesSection({ module }: { module: ProposalModule }) {
  const data = module.data || {};
  const items = data.items || [];

  return (
    <MotionSection className="p-8 md:p-10 bg-white text-zinc-950">
      <div className="max-w-5xl w-full">
        <AnimatedTitle text={data.title || 'Referencias'} className="heading-2 text-center mb-12 tracking-tight text-zinc-950" />
        <PremiumGallery images={items.filter((i: any) => i.imageUrl).map((i: any) => ({ src: i.imageUrl, alt: i.title }))} />
      </div>
    </MotionSection>
  );
}
