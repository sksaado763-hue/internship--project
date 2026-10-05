import { Binary, Blend, Braces, CaseSensitive, Clock3, FileText, Fingerprint, KeyRound, Link2, Palette, Type } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';
import { toolRegistry } from '../../../shared/toolRegistry.js';

const icons = { Binary, Blend, Braces, CaseSensitive, Clock3, FileText, Fingerprint, KeyRound, Link2, Palette, Type };
const categoriesBySlug = Object.fromEntries(categoryRegistry.map((category) => [category.slug, category]));

export const tools = toolRegistry.map((tool) => ({
  ...tool,
  category: categoriesBySlug[tool.categorySlug]?.name ?? tool.categorySlug,
  icon: icons[tool.icon] ?? FileText,
}));

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));
