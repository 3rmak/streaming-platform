import { Router } from 'express';
import { LocalContentService } from '../../services/local-content/local-content.service';

const router = Router();

router.get('/video', (req, res) => {
  return LocalContentService.getLocalContent(req, res);
});
router.post('/video-name', (req, res) => {
  return LocalContentService.setCustomLocalVideo(req, res);
});

export default router;
