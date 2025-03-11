const Service = require('../models/serviceModel');

import { Request, Response } from 'express';

exports.getIndex = async (req: Request, res: Response) => {
    try {
        // Recupera i servizi dal database (limitati a 3 per la homepage)
        const services = await Service.findAll({ 
            limit: 3,
            order: [['createdAt', 'DESC']] // Ordina per i più recenti
        });
        
        // Renderizza la pagina con i servizi
        res.render('index', { 
            services,
            title: 'HelpDigit - Soluzioni Digitali Professionali',
            description: 'Soluzioni digitali personalizzate per privati e aziende. Digitalizzazione, supporto tecnico e consulenza informatica a Bari.'
        });
    } catch (error) {
        console.error('Errore nel caricamento dei servizi:', error);
        // In caso di errore, renderizza la pagina senza servizi
        res.render('index', { 
            services: [],
            title: 'HelpDigit - Soluzioni Digitali Professionali',
            description: 'Soluzioni digitali personalizzate per privati e aziende. Digitalizzazione, supporto tecnico e consulenza informatica a Bari.'
        });
    }
};