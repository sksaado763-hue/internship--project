import { Calculator, Clapperboard, Code2, FileText, Image, TrendingUp, WandSparkles } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';

export const categoryIcons = {
  Text: FileText,
  Developer: Code2,
  SEO: TrendingUp,
  Image,
  PDF: FileText,
  'Calculators & Financial Tools': Calculator,
  'Social Media & Video Tools': Clapperboard,
  'AI & Smart Generators': WandSparkles,
};

export const mainNavigation = [
  { label: 'Home', href: '/#home' },
  { label: 'All Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Games', href: '/games' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const platformStats = [
  { value: '26', label: 'Working browser tools' },
  { value: 'Fast', label: 'Browser processing' },
  { value: 'Free', label: 'Core tools' },
  { value: 'Privacy', label: 'Focused by design' },
];

export const toolCategories = categoryRegistry;

const categoryLink = (name) => ({ label: name, href: `/tools?category=${encodeURIComponent(name)}` });

export const footerSections = [
  {
    title: 'Documents & AI',
    icon: FileText,
    links: [
      { label: 'All tools', href: '/tools' },
      ...['PDF', 'AI & Smart Generators', 'Image'].map(categoryLink),
    ],
  },
  {
    title: 'Web & Social',
    icon: Code2,
    links: ['Developer', 'Social Media & Video Tools', 'SEO'].map(categoryLink),
  },
  {
    title: 'Calculators & More',
    icon: Calculator,
    links: [
      ...['Calculators & Financial Tools', 'Text'].map(categoryLink),
      { label: 'Favorites', href: '/tools?category=Favorites', highlight: true },
    ],
  },
];
