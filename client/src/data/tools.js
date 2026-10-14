import { Activity, AppWindow, ArrowLeftRight, AudioLines, AudioWaveform, Baby, Banknote, Binary, Blend, Braces, Calculator, CalendarHeart, Captions, CaseSensitive, ChartLine, Clapperboard, Clock, Clock3, Code2, Coins, CopyCheck, Crop, Dices, Divide, Download, Droplets, Eye, Facebook, FileArchive, FileCode, FileImage, FileOutput, FilePen, FileSearch, FileSpreadsheet, FileText, FileUser, Fingerprint, Gauge, GitMerge, Globe, GraduationCap, Hash, HeartPulse, Home, ImageDown, ImageMinus, ImagePlus, Instagram, KeyRound, Landmark, Laugh, Link2, Lock, Mail, MessagesSquare, Mic, Monitor, Network, Palette, PanelsTopLeft, Percent, PiggyBank, Pipette, Presentation, QrCode, Receipt, RefreshCw, RotateCw, Ruler, ScanText, School, Scissors, SearchCode, Shapes, ShieldCheck, SpellCheck, SquareFunction, Tags, Timer, TrendingUp, Triangle, Twitter, Type, Wallet, WandSparkles, Youtube } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';
import { toolRegistry } from '../../../shared/toolRegistry.js';



const icons = { Activity, AppWindow, ArrowLeftRight, AudioLines, AudioWaveform, Baby, Banknote, Binary, Blend, Braces, Calculator, CalendarHeart, Captions, CaseSensitive, ChartLine, Clapperboard, Clock, Clock3, Code2, Coins, CopyCheck, Crop, Dices, Divide, Download, Droplets, Eye, Facebook, FileArchive, FileCode, FileImage, FileOutput, FilePen, FileSearch, FileSpreadsheet, FileText, FileUser, Fingerprint, Gauge, GitMerge, Globe, GraduationCap, Hash, HeartPulse, Home, ImageDown, ImageMinus, ImagePlus, Instagram, KeyRound, Landmark, Laugh, Link2, Lock, Mail, MessagesSquare, Mic, Monitor, Network, Palette, PanelsTopLeft, Percent, PiggyBank, Pipette, Presentation, QrCode, Receipt, RefreshCw, RotateCw, Ruler, ScanText, School, Scissors, SearchCode, Shapes, ShieldCheck, SpellCheck, SquareFunction, Tags, Timer, TrendingUp, Triangle, Twitter, Type, Wallet, WandSparkles, Youtube };
const categoriesBySlug = Object.fromEntries(categoryRegistry.map((category) => [category.slug, category]));

const aiToolOrder = [
  'ai-background-remover', 'ai-content-detector', 'ai-email-writer', 'ai-text-humanizer',
  'ai-image-generator', 'ai-voiceover-studio', 'ai-voice-typing', 'fake-chat-generator',
  'favicon-generator', 'glassmorphism-generator', 'image-upscaler', 'ai-video-caption-generator',
  'instagram-caption-generator', 'meme-generator', 'qr-code-generator', 'random-number-generator',
  'resume-builder', 'seo-meta-generator', 'sitemap-generator', 'svg-shape-generator',
  'unicode-font-generator', 'voice-changer', 'youtube-name-generator', 'youtube-title-generator',
  'youtube-hashtag-generator', 'youtube-hook-generator',
];

export const tools = toolRegistry
  .filter((tool) => !tool.hidden)
  .map((tool) => ({
    ...tool,
    category: categoriesBySlug[tool.categorySlug]?.name ?? tool.categorySlug,
    icon: icons[tool.icon] ?? FileText,
  })).sort((a, b) => {
    const aIsAi = a.category === 'AI & Smart Generators';
    const bIsAi = b.category === 'AI & Smart Generators';
    if (aIsAi && bIsAi) return aiToolOrder.indexOf(a.slug) - aiToolOrder.indexOf(b.slug);
    if (aIsAi) return -1;
    if (bIsAi) return 1;
    return 0;
  });

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));
