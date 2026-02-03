import { Router } from 'express';
import { login_GET, login_POST, logout_GET } from '../controllers/auth.controller';

const router = Router();

router.get('/login', login_GET);
router.post('/login', login_POST);
router.get('/logout', logout_GET);

export { router as authRouter };
