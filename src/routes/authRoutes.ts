import { Router } from 'express';
import { getLogin, postLogin, getRegister, postRegister, getLogout } from '../controllers/authController';

const router = Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', getLogout);

export default router;