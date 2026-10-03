import { Router } from 'express';
import { getTools } from '../controllers/toolController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import validateCatalogQuery from '../middleware/validateCatalogQuery.js';

const router = Router();
router.get('/', validateCatalogQuery, requireDatabase, getTools);

export default router;
