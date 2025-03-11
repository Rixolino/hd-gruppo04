"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const settingsController = __importStar(require("../controllers/settingsController"));
const router = express_1.default.Router();
// Proteggi tutte le route con l'autenticazione
router.use(authMiddleware_1.authenticate);
// Visualizza la pagina delle impostazioni
router.get('/', settingsController.getSettingsPage);
// Gestione degli aggiornamenti delle varie sezioni
router.post('/accessibility', settingsController.updateAccessibilitySettings);
router.post('/personalization', settingsController.updatePersonalizationSettings);
router.post('/notifications', settingsController.updateNotificationSettings);
router.post('/privacy', settingsController.updatePrivacySettings);
// Endpoint di test per le impostazioni
router.post('/test', settingsController.testSettings);
exports.default = router;
