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
Object.defineProperty(exports, "__esModule", { value: true });
const Service = require('../models/serviceModel');
exports.getIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Recupera i servizi dal database (limitati a 3 per la homepage)
        const services = yield Service.findAll({
            limit: 3,
            order: [['createdAt', 'DESC']] // Ordina per i più recenti
        });
        // Renderizza la pagina con i servizi
        res.render('index', {
            services,
            title: 'HelpDigit - Soluzioni Digitali Professionali',
            description: 'Soluzioni digitali personalizzate per privati e aziende. Digitalizzazione, supporto tecnico e consulenza informatica a Bari.'
        });
    }
    catch (error) {
        console.error('Errore nel caricamento dei servizi:', error);
        // In caso di errore, renderizza la pagina senza servizi
        res.render('index', {
            services: [],
            title: 'HelpDigit - Soluzioni Digitali Professionali',
            description: 'Soluzioni digitali personalizzate per privati e aziende. Digitalizzazione, supporto tecnico e consulenza informatica a Bari.'
        });
    }
});
