import Category from '../models/Category.js';
import Tool from '../models/Tool.js';

export async function listCategories() {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  const counts = await Tool.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', toolCount: { $sum: 1 } } },
  ]);
  const countByCategory = new Map(counts.map(({ _id, toolCount }) => [_id.toString(), toolCount]));
  return categories.map((category) => ({
    ...category,
    toolCount: countByCategory.get(category._id.toString()) ?? 0,
  }));
}
