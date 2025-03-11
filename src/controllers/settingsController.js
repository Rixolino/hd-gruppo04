"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSettings = exports.updatePrivacySettings = exports.updateNotificationSettings = exports.updatePersonalizationSettings = exports.updateAccessibilitySettings = exports.getSettingsPage = void 0;
const settingsModel_1 = __importDefault(require("../models/settingsModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
// Visualizza la pagina impostazioni
const getSettingsPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Carica le impostazioni dalla tabella settings
        let settings = yield settingsModel_1.default.findOne({
            where: { user_id: userId } // Cambiato da userId a user_id
        });
        // Se non esistono impostazioni, crea un record vuoto
        if (!settings) {
            settings = yield settingsModel_1.default.create({
                user_id: userId // Cambiato da userId a user_id
            });
        }
        // Carica l'utente per altre informazioni necessarie
        const userRecord = yield userModel_1.default.findByPk(userId);
        if (!userRecord) {
            return res.redirect('/auth/login');
        }
        // Converti il record utente in un oggetto plain JavaScript
        const user = userRecord.get({ plain: true });
        // Renderizza la pagina con i dati delle impostazioni
        res.render('settings', {
            user: {
                id: user.id,
                username: user.username || 'User',
                email: user.email,
                settings: settings.toJSON() // Usa le impostazioni dalla tabella settings
            },
            successMessage: req.query.success ? 'Impostazioni salvate con successo!' : undefined,
            errorMessage: req.query.error ? 'Si è verificato un errore durante il salvataggio.' : undefined
        });
    }
    catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
        // Invece di renderizzare una vista di errore, reindirizza alla pagina principale con un parametro di errore
        res.redirect('/?error=settings_load_failed');
    }
});
exports.getSettingsPage = getSettingsPage;
// Aggiorna le impostazioni di accessibilità
const updateAccessibilitySettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { fontSize, highContrast, reduceAnimations, colorBlindMode } = req.body;
        console.log('Aggiornamento impostazioni accessibilità:', req.body);
        // Trova o crea il record delle impostazioni
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        // Aggiorna i campi
        yield settings.update({
            fontSize: parseInt(fontSize) || 1,
            highContrast: highContrast === 'on',
            reduceAnimations: reduceAnimations === 'on',
            colorBlindMode: colorBlindMode || 'none'
        });
        res.redirect('/settings?success=true#accessibilita');
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di accessibilità:', error);
        res.redirect('/settings?error=true#accessibilita');
    }
});
exports.updateAccessibilitySettings = updateAccessibilitySettings;
// Aggiorna le impostazioni di personalizzazione
const updatePersonalizationSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { theme, primaryColor, layout } = req.body;
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        yield settings.update({
            theme: theme || 'light',
            primaryColor: primaryColor || 'default',
            layout: layout || 'default'
        });
        res.redirect('/settings?success=true#personalizzazione');
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di personalizzazione:', error);
        res.redirect('/settings?error=true#personalizzazione');
    }
});
exports.updatePersonalizationSettings = updatePersonalizationSettings;
// Aggiorna le impostazioni delle notifiche
const updateNotificationSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { emailNotifications, orderUpdates, promotions, newsletter } = req.body;
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        yield settings.update({
            emailNotifications: emailNotifications === 'on',
            orderUpdates: orderUpdates === 'on',
            promotions: promotions === 'on',
            newsletter: newsletter === 'on'
        });
        res.redirect('/settings?success=true#notifiche');
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di notifica:', error);
        res.redirect('/settings?error=true#notifiche');
    }
});
exports.updateNotificationSettings = updateNotificationSettings;
// Aggiorna le impostazioni della privacy
const updatePrivacySettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { dataTelemetry, cookies } = req.body;
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        yield settings.update({
            dataTelemetry: dataTelemetry === 'on',
            cookies: cookies === 'on'
        });
        res.redirect('/settings?success=true#privacy');
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di privacy:', error);
        res.redirect('/settings?error=true#privacy');
    }
});
exports.updatePrivacySettings = updatePrivacySettings;
// Endpoint di test per le impostazioni
const testSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { testValue } = req.body;
        // Recupera le impostazioni attuali dalla tabella settings
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        // Restituisci tutte le impostazioni come JSON
        res.json({
            success: true,
            testValue,
            message: 'Test completato con successo',
            settings: settings.toJSON()
        });
    }
    catch (error) {
        console.error('Errore nel test delle impostazioni:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il test delle impostazioni',
            error: error instanceof Error ? error.message : String(error) // Gestisci 'error' come 'unknown'
        });
    }
});
exports.testSettings = testSettings;
