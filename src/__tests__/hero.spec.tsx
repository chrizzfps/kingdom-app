import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeroSection } from '@/components/public/modules/HeroSection';

describe('HeroSection', () => {
  it('renders gradient fallback when image url missing', () => {
    const module = { type: 'HERO', data: { title: 'Test', subtitle: 'Sub', backgroundGradient: { angle: 45, colors: ['#33ccff', '#0054df'], animate: false } } };
    const { container } = render(<HeroSection module={module as any} />);
    const bgDivs = container.querySelectorAll('div[style*="linear-gradient"]');
    expect(bgDivs.length).toBeGreaterThan(0);
  });
});

