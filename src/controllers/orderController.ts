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
    const { servizio, prezzo } = req.body;
    const userId = req.user.id;
    
    const order = await Order.create({
      utenteId: userId,
      servizio,
      prezzo,
      stato: 'pagamento-in-attesa',
      dataRichiesta: new Date(),
      progressoLavoro: 0
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