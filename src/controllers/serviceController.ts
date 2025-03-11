import { Request, Response } from 'express';
import Service from '../models/serviceModel';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export class ServiceController {
    public async selectService(req: Request, res: Response): Promise<void> {
        try {
            // Ottieni i servizi dal database
            const services = await Service.findAll();
            
            // Verifica se c'è un utente autenticato
            const token = req.cookies.token;
            let user = null;
            
            if (token) {
                try {
                    user = jwt.verify(token, process.env.JWT_SECRET!);
                } catch (err) {
                    // Token non valido, user rimane null
                }
            }
            
            // Passa sia i servizi che l'utente (se presente) al template
            res.render('services', { services, user });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel recupero dei servizi', error: err.message });
        }
    }

    // Metodo per ottenere i servizi per la dashboard
    public async getServicesForDashboard(req: Request, res: Response): Promise<void> {
        try {
            const services = await Service.findAll();
            res.json(services);
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel recupero dei servizi', error: err.message });
        }
    }

    // Metodo per ottenere un singolo servizio per ID
    public async getServiceById(req: Request, res: Response): Promise<void> {
        const serviceId = req.params.id;
        
        try {
            const service = await Service.findByPk(serviceId);
            
            if (!service) {
                res.status(404).json({ message: 'Servizio non trovato' });
                return;
            }
            
            // Recupera servizi correlati
            const relatedServices = await Service.findAll({
                where: {
                    id: { [Op.ne]: serviceId }, // Escludi il servizio corrente
                    [Op.or]: [
                        { category: service.category }, // Stessa categoria
                        { category: { [Op.ne]: service.category } } // O categoria diversa
                    ]
                },
                limit: 2 // Limita a 2 servizi correlati
            });
            
            // Verifica se c'è un utente autenticato
            const token = req.cookies.token;
            let user = null;
            
            if (token) {
                try {
                    user = jwt.verify(token, process.env.JWT_SECRET!);
                } catch (err) {
                    // Token non valido, user rimane null
                }
            }
            
            res.render('service-detail', { service, relatedServices, user });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel recupero del servizio', error: err.message });
        }
    }

    // Metodo per la pagina di richiesta servizio
    public async requestService(req: Request, res: Response): Promise<void> {
        const serviceId = req.params.id;
        
        try {
            const service = await Service.findByPk(serviceId);
            
            if (!service) {
                res.status(404).json({ message: 'Servizio non trovato' });
                return;
            }
            
            res.render('service-request', { service, user: req.user });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nel recupero del servizio', error: err.message });
        }
    }

    // Metodo per creare un nuovo servizio
    public async createService(req: Request, res: Response): Promise<void> {
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

            const newService = await Service.create(serviceData);
            res.status(201).json({ message: 'Servizio creato con successo', service: newService });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nella creazione del servizio', error: err.message });
        }
    }

    // Metodo per modificare un servizio esistente
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

    // Metodo per eliminare un servizio
    public async deleteService(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const service = await Service.findByPk(id);
            if (service) {
                await service.destroy();
                res.status(200).json({ message: 'Servizio eliminato con successo' });
            } else {
                res.status(404).json({ message: 'Servizio non trovato' });
            }
        } catch (error) {
            const err = error as Error;
            res.status(500).json({ message: 'Errore nell\'eliminazione del servizio', error: err.message });
        }
    }
}