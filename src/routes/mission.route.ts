import { Router } from 'express';
import {
    data_GET,
    deleteMission_API_DELETE,
    deleteMission_POST,
    listMission_API_GET,
    listMission_GET,
    uploadMission_API_POST,
    viewMission_GET,
} from '../controllers/mission.controller';
import { isAuthenticated, validateApiKey } from '../middlewares/auth.middleware';
import { uploadZip } from '../lib/multer';

const router = Router();

router.get('/', isAuthenticated, listMission_GET);
router.get('/:missionId/data', isAuthenticated, data_GET);
router.get('/mission-list', isAuthenticated, listMission_API_GET);
router.get('/:missionId', isAuthenticated, viewMission_GET);
router.post('/:missionId/delete', isAuthenticated, deleteMission_POST);
router.delete('/:missionId/delete', isAuthenticated, deleteMission_API_DELETE);
router.post('/upload', validateApiKey, uploadZip.single('missionZip'), uploadMission_API_POST);

export { router as missionRouter };
