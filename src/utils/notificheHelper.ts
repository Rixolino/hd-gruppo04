import { Server } from 'socket.io';
import UserModel from '../models/userModel';
import NotificaModel from '../models/notificaModel';

let io: Server | null = null;

// Inizializzazione del server Socket.IO
export const initSocketServer = (server: any) => {
  io = new Server(server);
  
  // Middleware di autenticazione per Socket.IO
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token di autenticazione mancante'));
    }
    
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Token di autenticazione non valido'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connesso:', socket.id);
    
    socket.on('authenticate', async (data) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        
        // Salva l'utente nei dati del socket
        socket.data.user = decoded;
        
        // Controlla se l'utente è un amministratore
        const user = await UserModel.findByPk(decoded.userId);
        if (user && user.isAdmin) {
          // Aggiunge l'utente alla stanza admin
          socket.join('admin');
          socket.emit('authenticated', { success: true });
          console.log(`Admin ${user.nome} autenticato`);
        } else {
          socket.emit('authenticated', { success: true, isAdmin: false });
        }
      } catch (error) {
        socket.emit('authentication_error', { message: 'Token non valido' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnesso:', socket.id);
    });
  });
  
  return io;
};

// Funzione per inviare notifiche agli amministratori
export const notificaAdmin = async (
  tipo: string, 
  messaggio: string, 
  entityId?: number | string, 
  entityType?: string
) => {
  try {
    // Trova tutti gli utenti admin
    const admins = await UserModel.findAll({
      where: {
        isAdmin: true
      }
    });
    
    if (!admins || admins.length === 0) {
      console.log('Nessun admin trovato per inviare notifiche');
      return;
    }
    
    // Crea oggetti notifica per ogni admin
    for (const admin of admins) {
      // Crea la notifica utilizzando il modello Sequelize
      const notifica = await NotificaModel.create({
        tipo: tipo,
        messaggio: messaggio,
        letto: false,
        data: new Date(),
        utenteId: admin.id,
        entityId: entityId || null,
        entityType: entityType || null
      });
      
      // Invia la notifica tramite Socket.IO se disponibile
      if (io) {
        io.to('admin').emit('nuova_notifica', { notifica });
        console.log(`Notifica inviata agli admin: ${messaggio}`);
      } else {
        console.log('Socket.IO non inizializzato, notifica salvata solo su DB');
      }
    }
  } catch (error) {
    console.error('Errore nell\'invio della notifica agli admin:', error);
  }
};

export default {
  initSocketServer,
  notificaAdmin
};