import { useEffect, useMemo } from 'react';
import { Search, WandSparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ToolCard from '../components/common/ToolCard.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { tools } from '../data/tools.js';

const POPULAR_FEATURED_SLUGS = [
  'word-counter', 'character-counter', 'case-converter', 'json-formatter',
  'url-encoder-decoder', 'base64-encoder-decoder', 'password-generator', 'ai-background-remover',
];

const TOOL_SECTIONS = [
  {
    id: 'popular-featured',
    title: 'Popular Featured Tools',
    description: 'Most frequently used utilities by our global creators & power users',
    select: (tool) => POPULAR_FEATURED_SLUGS.includes(tool.slug),
  },
  {
    id: 'ai-generators',
    title: 'AI & Smart Generators',
    description: 'Next-gen artificial intelligence, voice engines, call studio & generators',
    select: (tool) => tool.category === 'AI & Smart Generators',
  },
  {
    id: 'pdf-documents',
    title: 'PDF & Document Utilities',
    description: 'Convert, edit, merge, split, sign, protect and compress PDF documents',
    select: (tool) => [
      'word-counter', 'character-counter', 'case-converter', 'slug-generator', 'lorem-ipsum-generator',
      'text-diff-checker', 'csv-to-json', 'json-to-csv', 'markdown-table-generator',
      'resume-builder', 'ai-powerpoint-generator', 'html-entity-encoder',
      'html-to-pdf', 'grammar-checker', 'plagiarism-checker',
      'merge-pdf', 'pdf-merger', 'split-pdf', 'pdf-splitter', 'rotate-pdf', 'pdf-rotator',
      'compress-pdf', 'pdf-compressor', 'protect-pdf', 'watermark-pdf', 'sign-pdf', 'pdf-signature',
      'pdf-editor', 'image-to-pdf', 'jpg-to-pdf', 'pic-to-pdf', 'pdf-to-image', 'pdf-to-jpg',
      'invoice-generator', 'docx-to-pdf', 'word-to-pdf', 'pdf-to-docx', 'pdf-to-word',
      'pdf-to-excel', 'pdf-to-xlsx', 'pdf-to-powerpoint', 'pdf-to-pptx',
    ].includes(tool.slug),
  },
  {
    id: 'image-converters',
    title: 'Image Converters (Pic to Format)',
    description: 'High-speed batch raster & vector image format transformations',
    select: (tool) => [
      'ai-background-remover', 'image-upscaler', 'ai-image-generator', 'favicon-generator',
      'svg-shape-generator', 'color-converter', 'gradient-generator',
      'image-compressor', 'image-cropper', 'pic-to-png', 'pic-to-jpg', 'pic-to-webp',
      'pic-to-gif', 'pic-to-ico', 'pic-to-bmp', 'pic-to-svg', 'code-to-image', 'color-picker',
      'colorblind-simulator', 'heic-converter', 'ocr-image-to-text',
    ].includes(tool.slug),
  },
  {
    id: 'calculators',
    title: 'Calculators & Financial Tools',
    description: 'Loan EMI, mortgages, salary, taxes, pregnancy, GPA and scientific precision math engines',
    select: (tool) => [
      'percentage-calculator', 'number-base-converter', 'timestamp-converter',
      'age-calculator', 'amortization-calculator', 'auto-loan-calculator', 'unit-converter',
      'bmi-calculator', 'bmr-calculator', 'body-fat-calculator', 'calorie-calculator',
      'mortgage-calculator', 'compound-interest-calculator', 'loan-calculator', 'interest-calculator',
      'interest-rate-calculator', 'investment-calculator', 'retirement-calculator', 'inflation-calculator',
      'sales-tax-calculator', 'salary-calculator', 'scientific-calculator', 'fraction-calculator',
      'gpa-calculator', 'grade-calculator', 'standard-deviation-calculator', 'triangle-calculator',
      'ideal-weight-calculator', 'pace-calculator', 'concrete-calculator', 'due-date-calculator',
      'pregnancy-conception-calculator', 'conversion-calculator', 'finance-calculator',
      'payment-calculator', 'income-tax-calculator', 'currency-converter',
    ].includes(tool.slug),
  },
  {
    id: 'developer',
    title: 'Developer & Web Utilities',
    description: 'JSON, Base64, JWT, regex, subnet, password and network debugging tools for builders',
    select: (tool) => [
      'json-formatter', 'url-encoder-decoder', 'base64-encoder-decoder', 'password-generator',
      'uuid-generator', 'html-entity-encoder', 'regex-tester', 'jwt-debugger', 'binary-converter',
      'ip-subnet-calculator', 'whats-my-ip', 'world-clock', 'speed-test', 'code-compiler',
    ].includes(tool.slug),
  },
  {
    id: 'social-video',
    title: 'Social Media & Video Tools',
    description: 'YouTube, Instagram, TikTok downloaders, hashtag finders, comment pickers and analytics',
    select: (tool) => [
      'video-editing-studio', 'instagram-carousel-maker', 'instagram-downloader', 'instagram-grid-splitter',
      'tiktok-downloader', 'youtube-channel-audit', 'youtube-comment-picker', 'youtube-thumbnail-downloader',
      'instagram-caption-generator', 'youtube-title-generator', 'youtube-hashtag-generator', 'youtube-hook-generator',
      'youtube-video-downloader', 'facebook-downloader', 'twitter-downloader', 'pinterest-downloader',
      'yt-video-script-generator', 'yt-tags-inspector', 'yt-thumbnail-ab-tester', 'yt-details-extractor',
      'audio-cutter', 'video-cutter', 'screen-recorder',
    ].includes(tool.slug),
  },
  {
    id: 'seo-checks',
    title: 'SEO & Website Health Checkers',
    description: 'Domain age lookups, SSL certificate guidance, and backlink analysis helpers',
    select: (tool) => [
      'domain-age', 'ssl-checker', 'backlink-checker',
    ].includes(tool.slug),
  },
];

export default function ToolsPage({ onSearchTermChange, defaultCategory = 'All tools' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const query = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? defaultCategory;
  const popularOnly = searchParams.get('popular') === 'true';
  const newOnly = searchParams.get('new') === 'true';
  const availableCategories = ['All tools', ...new Set(tools.map((tool) => tool.category)), 'Favorites'];
  const isAiCategory = category === 'AI & Smart Generators';

  useEffect(() => {
    onSearchTermChange?.(query);
  }, [onSearchTermChange, query]);

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return tools.filter((tool) => {
      const matchesSearch = !normalizedQuery || [tool.name, tool.description, tool.category, ...tool.tags]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesCategory = category === 'All tools' || (category === 'Favorites'
        ? favorites.includes(tool.slug)
        : tool.category.toLocaleLowerCase() === category.toLocaleLowerCase());
      return matchesSearch && matchesCategory && (!popularOnly || tool.isPopular) && (!newOnly || tool.isNew);
    });
  }, [category, favorites, newOnly, popularOnly, query]);

  const groupedSections = useMemo(() => {
    const claimed = new Set();
    const sections = TOOL_SECTIONS.map((section) => {
      const sectionTools = visibleTools.filter(section.select);
      sectionTools.forEach((tool) => claimed.add(tool.slug));
      return { ...section, tools: sectionTools };
    }).filter((section) => section.tools.length > 0);
    const additionalTools = visibleTools.filter((tool) => !claimed.has(tool.slug));
    if (additionalTools.length) sections.push({
      id: 'more-tools', title: 'More Tools',
      description: 'Developer, SEO and everyday utilities', tools: additionalTools,
    });
    return sections;
  }, [visibleTools]);

  function updateSearch(value) {
    onSearchTermChange?.(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  }

  function selectCategory(value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'All tools') next.delete('category');
    else next.set('category', value);
    setSearchParams(next, { replace: true });
  }

  return (
    <section className="directory-page page-container" id="tool-directory" aria-labelledby="directory-title">
      <header className={`directory-header ${isAiCategory ? 'directory-header--ai' : ''}`}>
        {isAiCategory && <span className="directory-ai-icon"><WandSparkles size={25} aria-hidden="true" /></span>}
        <div className="directory-heading-copy">
          <h1 id="directory-title">{isAiCategory ? <>AI &amp; Smart Generators <span>({visibleTools.length})</span></> : <>Explore All <span>{tools.length} Tools</span></>}</h1>
          <p>{isAiCategory ? 'Next-gen artificial intelligence, voice engines, call studio & generators' : 'Filter tools by category or search by keyword below.'}</p>
        </div>
        {isAiCategory && <span className="directory-ai-count">{visibleTools.length} Tools</span>}
      </header>
      <div className="directory-controls">
        <label className="directory-search" htmlFor="directory-search-input"><Search size={21} aria-hidden="true" /><span className="visually-hidden">Search tools</span><input id="directory-search-input" type="search" value={query} onChange={(event) => updateSearch(event.target.value)} placeholder={`Search ${tools.length} tools by name or keyword`} autoComplete="off" /></label>
        <span className="directory-result-count" aria-live="polite">{isAiCategory ? `${visibleTools.length} Tools` : `Showing ${visibleTools.length} of ${tools.length} tools`}</span>
      </div>
      <div className="directory-filters" role="group" aria-label="Filter tools by category">
        {availableCategories.map((item) => <button type="button" key={item} className={`filter-chip ${category === item ? 'is-active' : ''}`} aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
      </div>
      {visibleTools.length ? (category === 'All tools' ? <div className="directory-sections">
        {groupedSections.map((section) => <section className="directory-section" key={section.id} aria-labelledby={`directory-section-${section.id}`}>
          <header className="directory-section-heading"><div><h2 id={`directory-section-${section.id}`}>{section.title} <span>({section.tools.length})</span></h2><p>{section.description}</p></div></header>
          <div className="tool-grid">{section.tools.map((tool) => <ToolCard key={tool.id} tool={tool} variant="directory" />)}</div>
        </section>)}
      </div> : <div className="tool-grid">{visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} variant="directory" />)}</div>) : (
        <div className="directory-empty" role="status"><Search size={22} aria-hidden="true" /><h2>No tools found</h2><p>Try another search, or switch the category filter.</p><button className="text-link" type="button" onClick={() => { setSearchParams({}, { replace: true }); }}>Clear filters</button></div>
      )}
    </section>
  );
}
