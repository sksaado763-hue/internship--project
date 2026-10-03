import { Binary, Braces, CaseSensitive, FileText, Link2, Type } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';
import { toolRegistry } from '../../../shared/toolRegistry.js';

const icons = { Binary, Braces, CaseSensitive, FileText, Link2, Type };
const categoriesBySlug = Object.fromEntries(categoryRegistry.map((category) => [category.slug, category]));

export const tools = toolRegistry.map((tool) => ({
  ...tool,
  category: categoriesBySlug[tool.categorySlug]?.name ?? tool.categorySlug,
  icon: icons[tool.icon] ?? FileText,
}));

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));
