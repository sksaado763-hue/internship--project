const POPULAR_FEATURED_SLUGS = [
  'word-counter', 'character-counter', 'case-converter', 'json-formatter',
  'url-encoder-decoder', 'base64-encoder-decoder', 'password-generator', 'ai-background-remover',
];

export const TOOL_SECTIONS = [
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
];

export function groupToolsIntoSections(tools) {
  const claimed = new Set();
  const sections = TOOL_SECTIONS.map((section) => {
    const sectionTools = tools.filter(section.select);
    sectionTools.forEach((tool) => claimed.add(tool.slug));
    return { ...section, tools: sectionTools };
  }).filter((section) => section.tools.length > 0);
  const additionalTools = tools.filter((tool) => !claimed.has(tool.slug));
  if (additionalTools.length) sections.push({
    id: 'more-tools', title: 'More Tools',
    description: 'Developer, SEO and everyday utilities', tools: additionalTools,
  });
  return sections;
}
