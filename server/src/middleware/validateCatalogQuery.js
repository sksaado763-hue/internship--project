const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function validateCatalogQuery(request, response, next) {
  const { search, category, popular, featured, new: isNew } = request.query;
  const validBoolean = (value) => value === undefined || value === 'true' || value === 'false';

  if (search !== undefined && (typeof search !== 'string' || search.trim().length > 100)) {
    return response.status(400).json({ success: false, message: 'Search must be 100 characters or fewer.' });
  }
  if (category !== undefined && (typeof category !== 'string' || !slugPattern.test(category))) {
    return response.status(400).json({ success: false, message: 'Category must be a valid slug.' });
  }
  if (![popular, featured, isNew].every(validBoolean)) {
    return response.status(400).json({ success: false, message: 'Boolean filters must be true or false.' });
  }
  return next();
}
