import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as settingsController from '../controllers/settingsController';

const router = express.Router();

// Proteggi tutte le route con l'autenticazione
router.use(authenticate);

// Visualizza la pagina delle impostazioni
router.get('/', settingsController.getSettingsPage);

// Gestione degli aggiornamenti delle varie sezioni
router.post('/accessibility', settingsController.updateAccessibilitySettings);
router.post('/personalization', settingsController.updatePersonalizationSettings);
router.post('/notifications', settingsController.updateNotificationSettings);
router.post('/privacy', settingsController.updatePrivacySettings);

// Endpoint di test per le impostazioni
router.post('/test', settingsController.testSettings);

export default router;