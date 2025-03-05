import { Router } from 'express';
import { showLoginForm, login, showRegisterForm, register, logout } from '../controllers/authController';

const router = Router();

router.get('/login', showLoginForm);
router.post('/login', login);
router.get('/register', showRegisterForm);
router.post('/register', register);
router.get('/logout', logout);

export default router;