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
exports.ServiceController = void 0;
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
class ServiceController {
    selectService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ottieni i servizi dal database
                const services = yield serviceModel_1.default.findAll();
                // Verifica se c'è un utente autenticato
                const token = req.cookies.token;
                let user = null;
                if (token) {
                    try {
                        user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    }
                    catch (err) {
                        // Token non valido, user rimane null
                    }
                }
                // Passa sia i servizi che l'utente (se presente) al template
                res.render('services', { services, user });
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nel recupero dei servizi', error: err.message });
            }
        });
    }
    // Metodo per ottenere i servizi per la dashboard
    getServicesForDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield serviceModel_1.default.findAll();
                res.json(services);
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nel recupero dei servizi', error: err.message });
            }
        });
    }
    // Metodo per ottenere un singolo servizio per ID
    getServiceById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceId = req.params.id;
            try {
                const service = yield serviceModel_1.default.findByPk(serviceId);
                if (!service) {
                    res.status(404).json({ message: 'Servizio non trovato' });
                    return;
                }
                // Recupera servizi correlati
                const relatedServices = yield serviceModel_1.default.findAll({
                    where: {
                        id: { [sequelize_1.Op.ne]: serviceId },
                        [sequelize_1.Op.or]: [
                            { category: service.category },
                            { category: { [sequelize_1.Op.ne]: service.category } } // O categoria diversa
                        ]
                    },
                    limit: 2 // Limita a 2 servizi correlati
                });
                // Verifica se c'è un utente autenticato
                const token = req.cookies.token;
                let user = null;
                if (token) {
                    try {
                        user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    }
                    catch (err) {
                        // Token non valido, user rimane null
                    }
                }
                res.render('service-detail', { service, relatedServices, user });
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nel recupero del servizio', error: err.message });
            }
        });
    }
    // Metodo per la pagina di richiesta servizio
    requestService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceId = req.params.id;
            try {
                const service = yield serviceModel_1.default.findByPk(serviceId);
                if (!service) {
                    res.status(404).json({ message: 'Servizio non trovato' });
                    return;
                }
                res.render('service-request', { service, user: req.user });
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nel recupero del servizio', error: err.message });
            }
        });
    }
    // Metodo per creare un nuovo servizio
    createService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceData = {
                    id: req.body.id,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: req.body.category,
                    icon: req.body.icon,
                    deliveryTime: req.body.deliveryTime,
                    revisions: req.body.revisions
                };
                const newService = yield serviceModel_1.default.create(serviceData);
                res.status(201).json({ message: 'Servizio creato con successo', service: newService });
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nella creazione del servizio', error: err.message });
            }
        });
    }
    // Metodo per modificare un servizio esistente
    editService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updatedData = req.body;
            try {
                const service = yield serviceModel_1.default.findByPk(id);
                if (service) {
                    yield service.update(updatedData);
                    res.status(200).json({ message: 'Servizio aggiornato con successo', service });
                }
                else {
                    res.status(404).json({ message: 'Servizio non trovato' });
                }
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nella modifica del servizio', error: err.message });
            }
        });
    }
    // Metodo per eliminare un servizio
    deleteService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const service = yield serviceModel_1.default.findByPk(id);
                if (service) {
                    yield service.destroy();
                    res.status(200).json({ message: 'Servizio eliminato con successo' });
                }
                else {
                    res.status(404).json({ message: 'Servizio non trovato' });
                }
            }
            catch (error) {
                const err = error;
                res.status(500).json({ message: 'Errore nell\'eliminazione del servizio', error: err.message });
            }
        });
    }
}
exports.ServiceController = ServiceController;
