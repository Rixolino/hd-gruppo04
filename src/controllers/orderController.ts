import { Request, Response } from 'express';
import Order from '../models/orderModel';
import User from '../models/userModel';

// Recupera gli ordini dell'utente corrente
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { utenteId: userId },
      order: [['dataRichiesta', 'DESC']]
    });
    
    res.render('dashboard', { 
      activeTab: 'active-requests',
      orders 
    });
  } catch (error) {
    console.error('Errore nel recupero degli ordini:', error);
    res.status(500).send('Errore nel caricamento degli ordini');
  }
};

// Crea un nuovo ordine
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { servizio, prezzo, titolo, descrizione, dettagliAggiuntivi } = req.body;
    const userId = req.user.id;
    
    const order = await Order.create({
      utenteId: userId,
      servizio,
      prezzo,
      stato: 'pagamento-in-attesa',
      dataRichiesta: new Date(),
      progressoLavoro: 0,
      titolo, // Add appropriate title
      descrizione, // Add appropriate description
      dettagliAggiuntivi // Add appropriate additional details
    });
    
    // Aggiunge punti fedeltà all'utente (1 punto per ogni euro speso)
    const user = await User.findByPk(userId);
    if (user) {
      const puntiDaAggiungere = Math.floor(Number(prezzo));
      await user.update({ 
        puntifedelta: user.puntifedelta + puntiDaAggiungere 
      });
    }
    
    res.redirect('/dashboard?tab=active-requests');
  } catch (error) {
    console.error('Errore nella creazione dell\'ordine:', error);
    res.status(500).send('Errore nella creazione dell\'ordine');
  }
};

// Aggiorna lo stato di un ordine
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, stato, progressoLavoro } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).send('Ordine non trovato');
    }
    
    await order.update({ 
      stato,
      progressoLavoro: progressoLavoro || order.progressoLavoro,
      dataConsegna: stato === 'completato' ? new Date() : order.dataConsegna
    });
    
    res.redirect('/dashboard?tab=active-requests');
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'ordine:', error);
    res.status(500).send('Errore nell\'aggiornamento dell\'ordine');
  }
};

// Aggiorna lo stato di un ordine dall'interfaccia admin
export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
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
    await Order.update({
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
};