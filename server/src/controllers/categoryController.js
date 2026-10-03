import { listCategories } from '../services/categoryService.js';

export async function getCategories(_request, response, next) {
  try {
    const categories = await listCategories();
    response.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}
