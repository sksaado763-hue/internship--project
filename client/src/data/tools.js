import { Binary, Blend, Braces, CaseSensitive, Clock3, Code2, FileText, FileUser, Fingerprint, ImagePlus, KeyRound, Link2, MessagesSquare, Palette, Presentation, Type, Youtube } from 'lucide-react';
import { categoryRegistry } from '../../../shared/toolCategories.js';
import { toolRegistry } from '../../../shared/toolRegistry.js';



const icons = { Binary, Blend, Braces, CaseSensitive, Clock3, Code2, FileText, FileUser, Fingerprint, ImagePlus, KeyRound, Link2, MessagesSquare, Palette, Presentation, Type, Youtube };
const categoriesBySlug = Object.fromEntries(categoryRegistry.map((category) => [category.slug, category]));

export const tools = toolRegistry.map((tool) => ({
  ...tool,
  category: categoriesBySlug[tool.categorySlug]?.name ?? tool.categorySlug,
  icon: icons[tool.icon] ?? FileText,
}));

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));
