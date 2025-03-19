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
exports.getDashboard = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ottieni l'ID utente dal token JWT decodificato nell'autenticazione
        const userId = req.user.userId;
        // Recupera i dati completi dell'utente dal database
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        // Recupera gli ordini attivi dell'utente
        const activeOrders = yield orderModel_1.default.findAll({
            where: {
                utenteId: userId,
                stato: ['in-attesa', 'pagamento-in-attesa', 'in-lavorazione']
            },
            order: [['dataRichiesta', 'DESC']]
        });
        // Recupera gli ordini completati dell'utente
        const completedOrders = yield orderModel_1.default.findAll({
            where: {
                utenteId: userId,
                stato: 'completato'
            },
            order: [['dataConsegna', 'DESC']],
            limit: 5
        });
        // Passa tutti i dati necessari al template
        res.render('dashboard', {
            user: user,
            activeOrders: activeOrders || [],
            completedOrders: completedOrders || [],
            activeTab: req.query.tab || 'overview'
        });
    }
    catch (error) {
        console.error('Errore nel caricamento della dashboard:', error);
        // Sostituisco il semplice invio di un messaggio con il rendering della pagina di errore
        res.status(500).render('error', { 
            user: req.user,
            message: 'Si è verificato un errore nel caricamento della dashboard', 
            error: error,
            showLogout: true // Flag per mostrare il pulsante di logout
        });
    }
});
exports.getDashboard = getDashboard;