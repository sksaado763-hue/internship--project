import { Router } from 'express';
import { getTool, getTools, patchToolVisibility } from '../controllers/toolController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import validateCatalogQuery from '../middleware/validateCatalogQuery.js';

const router = Router();

// GET /api/tools — list all visible tools
router.get('/', validateCatalogQuery, requireDatabase, getTools);

// GET /api/tools/:slug — get a single tool by slug
router.get('/:slug', requireDatabase, getTool);

// PATCH /api/tools/:slug/visibility — hide or unhide a tool
// Body: { "hidden": true | false }
router.patch('/:slug/visibility', requireDatabase, patchToolVisibility);

export default router;
