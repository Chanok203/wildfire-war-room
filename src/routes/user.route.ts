import { Router } from 'express';
import { createUser_GET, createUser_POST, deleteUser_POST, editUser_GET, editUser_POST, listUser_GET } from '../controllers/user.controller';

const router = Router();

router.get('/', listUser_GET);
router.get('/create', createUser_GET);
router.post('/create', createUser_POST);
router.get('/:userId/edit', editUser_GET);
router.post('/:userId/edit', editUser_POST);
router.post('/:userId/delete', deleteUser_POST);

export { router as userRouter };
