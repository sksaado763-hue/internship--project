import { HeartPulse, RefreshCw, Youtube } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';

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

export const footerSections = [
  {
    title: 'Converters & Media',
    icon: RefreshCw,
    links: [
      { label: 'Image Upscaler', href: '/tools/image-upscaler' },
      { label: 'Color Converter', href: '/tools/color-converter' },
      { label: 'CSS Gradient Generator', href: '/tools/gradient-generator' },
      { label: 'QR Code Generator', href: '/tools/qr-code-generator' },
      { label: 'Meme Generator', href: '/tools/meme-generator' },
    ],
  },
  {
    title: 'YouTube & Creator AI',
    icon: Youtube,
    links: [
      { label: 'YouTube Thumbnail Downloader', href: '/tools/youtube-thumbnail-downloader' },
      { label: 'YouTube Channel Audit', href: '/tools/youtube-channel-audit' },
      { label: 'YouTube Comment Picker', href: '/tools/youtube-comment-picker' },
      { label: 'YouTube Title Generator', href: '/tools/youtube-title-generator' },
      { label: 'Resume Builder', href: '/tools/resume-builder' },
      { label: 'AI PowerPoint Generator', href: '/tools/ai-powerpoint-generator' },
    ],
  },
  {
    title: 'Health & Suite',
    icon: HeartPulse,
    links: [
      { label: 'BMI Calculator', href: '/tools/bmi-calculator' },
      { label: 'Calorie Calculator', href: '/tools/calorie-calculator' },
      { label: 'Body Fat Calculator', href: '/tools/body-fat-calculator' },
      { label: 'Age Calculator', href: '/tools/age-calculator' },
      { label: 'Loan & Finance Calc', href: '/tools/amortization-calculator' },
      { label: 'All Arcade Games', href: '/games', highlight: true },
    ],
  },
];
