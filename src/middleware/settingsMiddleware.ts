import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';
import SettingsModel from '../models/settingsModel'; // Importa il modello SettingsModel

// Estendi l'interfaccia Request per includere l'utente
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const loadUserSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica se l'utente è autenticato
    if (req.user && req.user.userId) {
      // Recupera le impostazioni dalla tabella settings anziché dall'utente
      const settings = await SettingsModel.findOne({
        where: { user_id: req.user.userId } // Cambiato da userId a user_id
      });
      
      if (settings) {
        // Aggiungi le impostazioni utente all'oggetto res.locals
        res.locals.userSettings = settings || {};
        
        // Applica le impostazioni al body tag
        res.locals.bodyClasses = [];
        
        if (settings) {
          // Tema
          if (settings.theme === 'dark') {
            res.locals.bodyClasses.push('dark-theme');
          }
          
          // Dimensione font
          if (settings.fontSize) {
            res.locals.bodyClasses.push(`font-size-${settings.fontSize}`);
          }
          
          // Contrasto elevato
          if (settings.highContrast) {
            res.locals.bodyClasses.push('high-contrast');
          }
          
          // Animazioni ridotte
          if (settings.reduceAnimations) {
            res.locals.bodyClasses.push('reduce-animations');
          }
          
          // Colore primario
          if (settings.primaryColor) {
            res.locals.bodyClasses.push(`primary-color-${settings.primaryColor}`);
          }
          
          // Layout
          if (settings.layout) {
            res.locals.bodyClasses.push(`layout-${settings.layout}`);
          }
        }
      }
    } else {
      // Se l'utente non è autenticato, imposta impostazioni di default
      res.locals.userSettings = {};
    }
    
    next();
  } catch (error) {
    console.error('Errore nel caricamento delle impostazioni utente:', error);
    // Continua comunque con le impostazioni di default
    res.locals.userSettings = {};
    next();
  }
};