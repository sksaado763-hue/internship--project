import { Router } from 'express';
import { getCategories } from '../controllers/categoryController.js';
import requireDatabase from '../middleware/requireDatabase.js';

const router = Router();
router.get('/', requireDatabase, getCategories);

export default router;
