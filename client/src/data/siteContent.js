import { categoryRegistry } from '../../../shared/toolCategories.js';

export const mainNavigation = [
  { label: 'Home', href: '/#home' },
  { label: 'All Tools', href: '/tools' },
  { label: 'Blog', href: '/#blog' },
  { label: 'Games', href: '/tools?search=meme' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: 'mailto:hello@meridian.tools' },
];

export const platformStats = [
  { value: '26', label: 'Working browser tools' },
  { value: 'Fast', label: 'Browser processing' },
  { value: 'Free', label: 'Core tools' },
  { value: 'Privacy', label: 'Focused by design' },
];

export const toolCategories = categoryRegistry;

export const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'All tools', href: '/tools' },
      { label: 'Popular tools', href: '/tools?popular=true' },
      { label: 'New tools', href: '/tools?new=true' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Developer', href: '/#categories' },
      { label: 'Text', href: '/tools?category=Text' },
      { label: 'SEO', href: '/#categories' },
      { label: 'Image', href: '/#categories' },
      { label: 'PDF', href: '/#categories' },
      { label: 'Calculators', href: '/#categories' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Contact', href: 'mailto:hello@meridian.tools' },
      { label: 'Blog', href: '/#blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/#privacy' },
      { label: 'Terms', href: '/#terms' },
      { label: 'Cookie policy', href: '/#cookies' },
    ],
  },
];
