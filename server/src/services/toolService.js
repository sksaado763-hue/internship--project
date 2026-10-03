import Category from '../models/Category.js';
import Tool from '../models/Tool.js';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listTools(filters = {}) {
  const query = { isActive: true };

  if (filters.category) {
    const category = await Category.findOne({ slug: filters.category, isActive: true }).select('_id').lean();
    if (!category) return [];
    query.category = category._id;
  }

  for (const key of ['popular', 'featured', 'new']) {
    if (filters[key] !== undefined) query[key === 'new' ? 'isNew' : `is${key[0].toUpperCase()}${key.slice(1)}`] = filters[key] === 'true';
  }

  const search = filters.search?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    query.$or = [{ name: pattern }, { description: pattern }, { tags: pattern }];
  }

  return Tool.find(query)
    .populate('category', 'name slug')
    .sort({ isFeatured: -1, isPopular: -1, createdAt: -1, name: 1 })
    .lean();
}
