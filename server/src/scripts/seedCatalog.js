import 'dotenv/config';
import mongoose from 'mongoose';
import { categoryRegistry } from '../../../shared/toolCategories.js';
import { toolRegistry } from '../../../shared/toolRegistry.js';
import Category from '../models/Category.js';
import Tool from '../models/Tool.js';

async function seedCatalog() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in server/.env before seeding the catalog.');
  await mongoose.connect(process.env.MONGODB_URI);

  const categoryIds = new Map();
  for (const category of categoryRegistry) {
    const savedCategory = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: { name: category.name, description: category.description, icon: 'Boxes', isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(category.slug, savedCategory._id);
  }

  for (const tool of toolRegistry) {
    await Tool.findOneAndUpdate(
      { slug: tool.slug },
      {
        $set: {
          name: tool.name,
          description: tool.description,
          category: categoryIds.get(tool.categorySlug),
          icon: tool.icon,
          tags: tool.tags,
          isPopular: tool.isPopular,
          isFeatured: tool.isFeatured,
          isNew: tool.isNew,
          isActive: true,
          processingType: tool.processingType,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  console.info(`Catalog seeded: ${categoryRegistry.length} categories and ${toolRegistry.length} tools.`);
}

seedCatalog()
  .catch((error) => {
    console.error('Catalog seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
