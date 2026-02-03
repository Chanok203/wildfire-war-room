import { Router } from 'express';
import { createApiKey_POST, deleteApiKey_POST, listApiKey_GET } from '../controllers/api-key.controller';

const router = Router();

router.get('/', listApiKey_GET);
router.post('/', createApiKey_POST);
router.post('/delete', deleteApiKey_POST);

export { router as apiKeyRouter };
