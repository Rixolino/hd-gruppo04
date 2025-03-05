import { Request, Response } from 'express';
import Service from '../models/serviceModel';

export class ServiceController {
    public async selectService(req: Request, res: Response): Promise<void> {
        try {
            const services = await Service.findAll();
            res.render('services', { services });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel recupero dei servizi', error: err.message });
        }
    }

    public async submitRequest(req: Request, res: Response): Promise<void> {
        const { userId, serviceId, details } = req.body;
        const serviceRequest = { userId, serviceId, details, status: 'In lavorazione' };

        try {
            const newService = await Service.create(serviceRequest);
            res.status(201).json({ message: 'Richiesta inviata con successo', service: newService });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nell\'invio della richiesta', error: err.message });
        }
    }

    public async editService(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const updatedData = req.body;

        try {
            const service = await Service.findByPk(id);
            if (service) {
                await service.update(updatedData);
                res.status(200).json({ message: 'Servizio aggiornato con successo', service });
            } else {
                res.status(404).json({ message: 'Servizio non trovato' });
            }
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nella modifica del servizio', error: err.message });
        }
    }
}