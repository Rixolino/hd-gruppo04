import UserModel from '../models/userModel';
import Notifica from '../models/notificaModel';

/**
 * Invia una notifica a tutti gli amministratori
 * @param tipo - Il tipo di notifica
 * @param messaggio - Il messaggio della notifica
 * @param entityId - ID dell'entità correlata (es. ordine)
 * @param entityType - Tipo dell'entità correlata (es. 'ordine')
 */
export async function notificaAdmin(tipo: string, messaggio: string, entityId?: number, entityType?: string): Promise<void> {
  try {
    // Trova tutti gli utenti admin
    const admins = await UserModel.findAll({
      where: {
        isAdmin: true,
        isDeleted: false // se esiste questo campo, assicurati di selezionare solo utenti attivi
      }
    });
    
    // Crea una notifica per ogni admin
    const notifiche = admins.map(admin => ({
      tipo,
      messaggio,
      letto: false,
      data: new Date(),
      utenteId: admin.id,
      entityId: entityId || null,
      entityType: entityType || null
    }));
    
    // Inserisci tutte le notifiche nel database
    if (notifiche.length > 0) {
      await Notifica.bulkCreate(notifiche);
    }
    
    console.log(`[${tipo}] Notifiche inviate a ${admins.length} admin: ${messaggio}`);
  } catch (error) {
    console.error('Errore nell\'invio delle notifiche agli admin:', error);
  }
}