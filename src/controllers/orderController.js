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
exports.updateOrderStatus = exports.createOrder = exports.getUserOrders = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();

// Recupera gli ordini dell'utente corrente
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const orders = yield orderModel_1.default.findAll({
            where: { utenteId: userId },
            order: [['dataRichiesta', 'DESC']]
        });
        res.render('dashboard', {
            activeTab: 'active-requests',
            orders
        });
    }
    catch (error) {
        console.error('Errore nel recupero degli ordini:', error);
        res.status(500).send('Errore nel caricamento degli ordini');
    }
});
exports.getUserOrders = getUserOrders;

// Crea un nuovo ordine
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { servizio, prezzo } = req.body;
        const userId = req.user.id;
        const order = yield orderModel_1.default.create({
            utenteId: userId,
            servizio,
            prezzo,
            stato: 'pagamento-in-attesa',
            dataRichiesta: new Date(),
            progressoLavoro: 0
        });
        // Aggiunge punti fedeltà all'utente (1 punto per ogni euro speso)
        const user = yield userModel_1.default.findByPk(userId);
        if (user) {
            const puntiDaAggiungere = Math.floor(Number(prezzo));
            yield user.update({
                puntifedelta: user.puntifedelta + puntiDaAggiungere
            });
        }
        res.redirect('/dashboard?tab=active-requests');
    }
    catch (error) {
        console.error('Errore nella creazione dell\'ordine:', error);
        res.status(500).send('Errore nella creazione dell\'ordine');
    }
});
exports.createOrder = createOrder;

// Aggiorna lo stato di un ordine
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, stato, progressoLavoro } = req.body;
        const order = yield orderModel_1.default.findByPk(orderId);
        if (!order) {
            return res.status(404).send('Ordine non trovato');
        }
        yield order.update({
            stato,
            progressoLavoro: progressoLavoro || order.progressoLavoro,
            dataConsegna: stato === 'completato' ? new Date() : order.dataConsegna
        });
        res.redirect('/dashboard?tab=active-requests');
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento dell\'ordine:', error);
        res.status(500).send('Errore nell\'aggiornamento dell\'ordine');
    }
});
exports.updateOrderStatus = updateOrderStatus;

// Route per aggiornare lo stato di un ordine da parte dell'admin
router.post('/admin/orders/:id/update-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const { stato, progressoLavoro } = req.body;
        
        // Verifica che i valori siano definiti
        if (stato === undefined || progressoLavoro === undefined) {
            return res.redirect('/admin/orders?error=Parametri mancanti');
        }

        // Converti progressoLavoro a numero se necessario
        const progressoNumerico = parseInt(progressoLavoro, 10);
        
        // Aggiorna l'ordine
        yield orderModel_1.default.update({
            stato,
            progressoLavoro: progressoNumerico
        }, {
            where: { id: orderId }
        });
        
        res.redirect('/admin/orders?success=Ordine aggiornato con successo');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'ordine:', error);
        res.redirect(`/admin/orders?error=${encodeURIComponent('Errore durante l\'aggiornamento dell\'ordine')}`);
    }
}));

module.exports = router;
