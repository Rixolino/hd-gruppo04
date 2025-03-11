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
exports.loadUserSettings = void 0;
const settingsModel_1 = __importDefault(require("../models/settingsModel")); // Importa il modello SettingsModel
const loadUserSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica se l'utente è autenticato
        if (req.user && req.user.userId) {
            // Recupera le impostazioni dalla tabella settings anziché dall'utente
            const settings = yield settingsModel_1.default.findOne({
                where: { user_id: req.user.userId } // Cambiato da userId a user_id
            });
            if (settings) {
                // Aggiungi le impostazioni utente all'oggetto res.locals
                res.locals.userSettings = settings || {};
                // Applica le impostazioni al body tag
                res.locals.bodyClasses = [];
                if (settings) {
                    // Tema
                    if (settings.theme === 'dark') {
                        res.locals.bodyClasses.push('dark-theme');
                    }
                    // Dimensione font
                    if (settings.fontSize) {
                        res.locals.bodyClasses.push(`font-size-${settings.fontSize}`);
                    }
                    // Contrasto elevato
                    if (settings.highContrast) {
                        res.locals.bodyClasses.push('high-contrast');
                    }
                    // Animazioni ridotte
                    if (settings.reduceAnimations) {
                        res.locals.bodyClasses.push('reduce-animations');
                    }
                    // Colore primario
                    if (settings.primaryColor) {
                        res.locals.bodyClasses.push(`primary-color-${settings.primaryColor}`);
                    }
                    // Layout
                    if (settings.layout) {
                        res.locals.bodyClasses.push(`layout-${settings.layout}`);
                    }
                }
            }
        }
        else {
            // Se l'utente non è autenticato, imposta impostazioni di default
            res.locals.userSettings = {};
        }
        next();
    }
    catch (error) {
        console.error('Errore nel caricamento delle impostazioni utente:', error);
        // Continua comunque con le impostazioni di default
        res.locals.userSettings = {};
        next();
    }
});
exports.loadUserSettings = loadUserSettings;
