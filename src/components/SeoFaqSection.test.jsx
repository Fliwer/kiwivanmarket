import React from 'react';
import { render, screen } from '@testing-library/react';
import SeoFaqSection from './SeoFaqSection';
import copy from '../data/seo/copy';
import searchCopy from '../data/seo/search-copy';
import { LONG_TAIL_PAGE_MAP } from '../constants/seoLongTailPages';

for (const lang of ['en', 'fr']) {
  test(`category and budget-page answers are visible in ${lang}`, () => {
    const text = copy[lang];
    const config = searchCopy.localizePage(LONG_TAIL_PAGE_MAP['buy-campervan-in-auckland-under-8000'], lang);
    const groups = [text.brand.faqs('Toyota Hiace', null), text.location.faqs('Auckland', null), searchCopy.searchFaqs(config, lang)];
    for (const faqs of groups) {
      const { unmount } = render(<SeoFaqSection title={text.common.faqTitle} faqs={faqs} />);
      expect(screen.getByRole('heading', { level: 2, name: text.common.faqTitle })).toBeTruthy();
      for (const { q, a } of faqs) {
        expect(screen.getByRole('heading', { level: 3, name: q })).toBeTruthy();
        expect(screen.getByText(a)).toBeTruthy();
      }
      unmount();
    }
  });
}

test('does not publish an empty FAQ section', () => {
  const { container } = render(<SeoFaqSection title="Frequently asked questions" faqs={[]} />);
  expect(container.firstChild).toBeNull();
});
