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
exports.PaymentController = void 0;
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
class PaymentController {
    processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, serviceId, userId } = req.body;
            const paymentData = { amount, serviceId, userId, status: 'pending' };
            try {
                const payment = yield paymentModel_1.default.create(paymentData);
                res.status(200).json({ message: 'Pagamento processato con successo', payment });
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nel processamento del pagamento', error: err.message });
            }
        });
    }
    confirmPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paymentId } = req.params;
            try {
                const payment = yield paymentModel_1.default.findByPk(paymentId);
                if (payment) {
                    yield payment.update({ status: 'confirmed' });
                    res.status(200).json({ message: 'Pagamento confermato con successo', payment });
                }
                else {
                    res.status(404).json({ message: 'Pagamento non trovato' });
                }
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nella conferma del pagamento', error: err.message });
            }
        });
    }
}
exports.PaymentController = PaymentController;
