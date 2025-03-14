import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { Op } from 'sequelize';

// Declare global variable type
declare global {
  var databaseAvailable: boolean;
}

import { initializeDatabase } from './config/db';
import UserModel from './models/userModel';
import { authenticate } from './middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import * as profileController from './controllers/profileController';
import * as dashboardController from './controllers/dashboardController';
import bcrypt from 'bcryptjs'; // Aggiungi questo all'inizio del file
import ServiceModel from './models/serviceModel'; // Assicurati di avere il modello ServiceModel
import { loadUserSettings } from './middleware/settingsMiddleware';
import SettingsModel from './models/settingsModel';
import settingsRoutes from './routes/settingsRoutes';
import { catchDatabaseErrors, handleDbError, isDbError } from './utils/errorHandlers';

// Sincronizza il modello con il database (aggiunge le colonne mancanti)
SettingsModel.sync({ alter: true }).then(() => {
  console.log('Tabella settings sincronizzata con il database');
}).catch(error => {
  console.error('Errore nella sincronizzazione della tabella settings:', error);
});

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Rimuovi la duplicazione
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// Sostituisci o aggiungi questa parte dopo la definizione di express

// Configura i percorsi statici per le immagini
app.use(express.static(path.join(__dirname, '../public'))); // Serve i file dalla cartella public

// Configura percorsi aggiuntivi per le immagini - supporto sia per sviluppo che per Vercel
app.use('/img', express.static(path.join(__dirname, '../public/img'))); // Prima opzione (sviluppo)
app.use('/img', express.static(path.join(__dirname, 'img'))); // Seconda opzione (se immagini sono in src/img)
app.use('/img', express.static(path.join(process.cwd(), 'public', 'img'))); // Terza opzione (Vercel)

// Log per debug
console.log('Directory immagini configurate:');
console.log('- Path 1:', path.join(__dirname, '../public/img'));
console.log('- Path 2:', path.join(__dirname, 'img'));
console.log('- Path 3:', path.join(process.cwd(), 'public', 'img'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Applica il middleware di impostazioni solo dopo l'autenticazione
app.use(loadUserSettings);

// Routes
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);  // Rimosso authenticate per permettere a tutti di vedere i servizi
app.use('/payments', authenticate, paymentRoutes);

// Aggiungi questo al file app.js o a dove registri le tue route
app.use('/settings', authenticate, settingsRoutes);

// Aggiungi questo al file app.js
const settingsMiddleware = require('./middleware/settingsMiddleware');
app.use(settingsMiddleware.loadUserSettings);

// Applica il middleware dopo l'inizializzazione della sessione e di passport
app.use(settingsMiddleware.loadUserSettings);

// Modifica l'inizializzazione del database (mantieni solo questa)
initializeDatabase()
    .then(() => {
        console.log('Database and tables created');
        global.databaseAvailable = true;
    })
    .catch(err => {
        console.error('Errore di connessione al database:', err);
        // Non possiamo reindirizzare qui perché non siamo in un contesto di richiesta/risposta
        // Ma possiamo impostare una variabile globale per indicare che il database non è disponibile
        global.databaseAvailable = false;
    });

// Aggiungi un middleware per controllare la disponibilità del database
app.use((req: Request, res: Response, next: NextFunction) => {
    if (global.databaseAvailable === false) {
        // Se il database non è disponibile, mostra subito la pagina di errore
        return handleDbError({ 
            message: 'Database non disponibile' 
        }, req, res);
    }
    next();
});

// Home route - controlla se l'utente è autenticato
app.get('/', catchDatabaseErrors(async (req: Request, res: Response) => {
    const token = req.cookies.token;
    
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return res.redirect('/dashboard');
        } catch (err) {
            res.clearCookie('token');
        }
    }
    
    // Recupera alcuni servizi da mostrare nella home page
    try {
        const services = await ServiceModel.findAll({
            limit: 3,
            order: [['createdAt', 'DESC']]
        });
        
        res.render('index', { services });
    } catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        res.render('index', { services: [] });
    }
}));

// Dashboard route - UNICA CORRETTA, RIMUOVI LE ALTRE DUE
app.get('/dashboard', authenticate, catchDatabaseErrors(dashboardController.getDashboard));

// Profile routes
app.get('/profile', authenticate, profileController.getProfile);
app.post('/profile/update', authenticate, profileController.updateProfile);
app.post('/profile/change-password', authenticate, profileController.changePassword);

// Settings route
app.get('/settings', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        return res.redirect('/auth/login');
    }
    
    res.render('settings', { 
        user: user,
        successMessage: req.query.success ? 'Impostazioni salvate con successo!' : undefined,
        errorMessage: req.query.error || undefined
    });
}));

// Gestione impostazioni di accessibilità
app.post('/settings/accessibility', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    console.log('Body ricevuto:', req.body);
    const userId = req.user.userId;
    const { fontSize, highContrast, reduceAnimations, colorBlindMode } = req.body;
    
    console.log('Ricerca utente con ID:', userId);
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        console.log('Utente non trovato');
        return res.redirect('/settings?error=Utente non trovato');
    }
    
    // Assicurati che settings esista o inizializzalo
    let settings = user.settings || {};
    
    // Aggiorna le impostazioni
    settings = {
        ...settings,
        fontSize: parseInt(fontSize) || 1,
        highContrast: highContrast === 'on',
        reduceAnimations: reduceAnimations === 'on',
        colorBlindMode: colorBlindMode || 'none'
    };
    
    // Aggiorna l'utente
    user.settings = settings;
    await user.save();
    
    res.redirect('/settings?success=Impostazioni di accessibilità salvate con successo#accessibilita');
}));

// Gestione impostazioni di personalizzazione
app.post('/settings/personalization', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    console.log('Body ricevuto:', req.body);
    const userId = req.user.userId;
    const { theme, primaryColor, layout } = req.body;
    
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        return res.redirect('/settings?error=Utente non trovato');
    }
    
    let settings = user.settings || {};
    settings = {
        ...settings,
        theme: theme || 'light',
        primaryColor: primaryColor || 'default',
        layout: layout || 'default'
    };
    
    user.settings = settings;
    await user.save();
    
    res.redirect('/settings?success=Personalizzazione salvata con successo#personalizzazione');
}));

// Gestione impostazioni delle notifiche
app.post('/settings/notifications', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    console.log('Body ricevuto:', req.body);
    const userId = req.user.userId;
    const { emailNotifications, orderUpdates, promotions, newsletter } = req.body;
    
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        return res.redirect('/settings?error=Utente non trovato');
    }
    
    let settings = user.settings || {};
    settings = {
        ...settings,
        emailNotifications: emailNotifications === 'on',
        orderUpdates: orderUpdates === 'on',
        promotions: promotions === 'on',
        newsletter: newsletter === 'on'
    };
    
    user.settings = settings;
    await user.save();
    
    res.redirect('/settings?success=Impostazioni notifiche salvate con successo#notifiche');
}));

// Gestione impostazioni della privacy
app.post('/settings/privacy', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    console.log('Body ricevuto:', req.body);
    const userId = req.user.userId;
    const { dataTelemetry, cookies } = req.body;
    
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        return res.redirect('/settings?error=Utente non trovato');
    }
    
    let settings = user.settings || {};
    settings = {
        ...settings,
        dataTelemetry: dataTelemetry === 'on',
        cookies: cookies === 'on'
    };
    
    user.settings = settings;
    await user.save();
    
    res.redirect('/settings?success=Impostazioni privacy salvate con successo#privacy');
}));

// Download dei dati utente
app.get('/user/download-data', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        res.status(404).send('Utente non trovato');
        return;
    }
    
    // Crea un oggetto JSON con tutti i dati dell'utente
    const userData = {
        userInfo: {
            id: user.id,
            nome: user.nome,
            cognome: user.cognome,
            email: user.email,
            telefono: user.telefono,
            createdAt: user.createdAt,
            settings: user.settings || {}
        }
    };
    
    // Imposta gli header per il download del file
    res.setHeader('Content-disposition', 'attachment; filename=i-miei-dati.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(userData, null, 2));
}));

// Cancellazione account
app.post('/user/delete-account', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;
        
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        
        // Verifica la password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.render('settings', { 
                user: req.user,
                errorMessage: 'Password non corretta. Impossibile eliminare l\'account.'
            });
        }
        
        // Implementa qui la logica di cancellazione account
        // Potresti voler marcare l'account come "da eliminare" invece di eliminarlo subito
        // o anonimizzare i dati invece di cancellarli completamente
        
        // Per esempio:
        user.isDeleted = true;
        user.email = `deleted_${userId}@example.com`;
        user.nome = 'Utente';
        user.cognome = 'Cancellato';
        await user.save();
        
        // Oppure per un'eliminazione completa:
        // await user.destroy();
        
        // Cancella il token di autenticazione
        res.clearCookie('token');
        
        res.render('account-deleted', {
            message: 'Il tuo account è stato cancellato con successo. Ci dispiace vederti andare!'
        });
    } catch (error) {
        console.error('Errore nella cancellazione dell\'account:', error);
        res.status(500).send('Errore nella cancellazione dell\'account');
    }
});

// Pagine informative - aggiungi user: null per non autenticati
app.get('/about', (req: Request, res: Response) => {
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
    
    res.render('about', { user });
});

app.get('/contact', (req: Request, res: Response) => {
    const token = req.cookies.token;
    let user = null;
    
    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {}
    }
    
    res.render('contact', { user });
});

app.get('/faq', (req: Request, res: Response) => {
    const token = req.cookies.token;
    let user = null;
    
    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {}
    }
    
    res.render('faq', { user });
});

app.get('/privacy', (req: Request, res: Response) => {
    const token = req.cookies.token;
    let user = null;
    
    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {}
    }
    
    res.render('privacy', { user });
});

app.get('/terms', (req: Request, res: Response) => {
    const token = req.cookies.token;
    let user = null;
    
    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {}
    }
    
    res.render('terms', { user });
});

app.get('/cookies', (req: Request, res: Response) => {
    const token = req.cookies.token;
    let user = null;
    
    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (err) {}
    }
    
    res.render('cookies', { user });
});

// Route per le richieste di servizi - richiedono autenticazione
app.get('/services/request/:id', authenticate, catchDatabaseErrors(async (req: Request, res: Response): Promise<void> => {
    const serviceId = req.params.id;
    
    try {
        // Recupera il servizio dal database
        const service = await ServiceModel.findByPk(serviceId);
        
        if (!service) {
            res.status(404).send('Servizio non trovato');
            return;
        }
        
        // Passa l'oggetto service E l'utente al template
        res.render('service-request', { service, user: req.user });
    } catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        res.status(500).send('Errore nel recupero del servizio');
    }
}));

// Route di test per le impostazioni
app.get('/test-settings', authenticate, catchDatabaseErrors(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      console.log('Test settings per userId:', userId);
      
      const user = await UserModel.findByPk(userId);
      
      if (!user) {
        res.json({ error: 'Utente non trovato' });
        return;
      }
      
      // Mostra le impostazioni correnti
      res.json({
        userId: userId,
        settings: user.settings || {},
        message: 'Se vedi questo messaggio, la lettura delle impostazioni funziona.'
      });
    } catch (error) {
      console.error('Errore test settings:', error);
      res.json({ error: String(error) });
    }
  }));

// Route per i dettagli dei servizi specifici - accessibile a tutti
app.get('/services/:id', catchDatabaseErrors(async (req: Request, res: Response): Promise<void> => {
    const serviceId = req.params.id;
    
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

    // Recupera il servizio dal database
    const service = await ServiceModel.findByPk(serviceId);
    
    if (!service) {
        res.status(404).send('Servizio non trovato');
        return;
    }
    
    // Recupera servizi correlati
    const relatedServices = await ServiceModel.findAll({
        where: {
            id: { [Op.ne]: serviceId },
            [Op.or]: [
                { category: service.category },
                { category: { [Op.ne]: service.category } }
            ]
        },
        limit: 2
    });
    
    // Passa l'oggetto service e relatedServices al template
    res.render('service-detail', { service, relatedServices, user });
}));

// Route per ottenere i servizi per la dashboard
app.get('/services/dashboard/services', authenticate, catchDatabaseErrors(async (req: Request, res: Response) => {
    const services = await ServiceModel.findAll();
    res.json(services);
}));

// API per recuperare i servizi (aggiungi questo codice prima di app.listen)

// API endpoint per ottenere tutti i servizi
app.get('/api/services', catchDatabaseErrors(async (req: Request, res: Response) => {
    const { limit, category } = req.query;
    
    // Costruisci le opzioni di query
    const options: any = {};
    
    // Limita il numero di risultati se specificato
    if (limit && !isNaN(Number(limit))) {
        options.limit = Number(limit);
    }
    
    // Filtra per categoria se specificata
    if (category) {
        options.where = {
            category: category
        };
    }
    
    // Ordina per id o un altro campo
    options.order = [['createdAt', 'DESC']];
    
    // Esegui la query
    const services = await ServiceModel.findAll(options);
    
    // Restituisci i servizi come JSON
    res.json(services);
}));

// API endpoint per ottenere un singolo servizio per ID
app.get('/api/services/:id', catchDatabaseErrors(async (req: Request, res: Response) => {
    const serviceId = req.params.id;
    
    const service = await ServiceModel.findByPk(serviceId);
    
    if (!service) {
        return res.status(404).json({ message: 'Servizio non trovato' });
    }
    
    res.json(service);
}));

// Aggiungi questo insieme alle altre route

// Endpoint per testare il salvataggio delle impostazioni
app.post('/test-settings', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { testValue } = req.body;
    
    // Recupera le impostazioni attuali dalla tabella settings
    const [settings, created] = await SettingsModel.findOrCreate({
      where: { user_id: userId }, // Corretto da userId a user_id
      defaults: { user_id: userId } // Corretto da userId a user_id
    });
    
    // Restituisci tutte le impostazioni come JSON
    res.json({
      success: true,
      testValue,
      message: 'Test completato con successo',
      settings: settings.toJSON()
    });
  } catch (error) {
    console.error('Errore nel test delle impostazioni:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il test delle impostazioni',
      error: (error as Error).message
    });
  }
});

// Aggiungi questo codice al tuo file app.ts

// API per recuperare le impostazioni utente
app.get('/api/user/settings', async (req: Request, res: Response) => {
  try {
    // Verifica se l'utente è autenticato attraverso il token nei cookie
    const token = req.cookies.token;
    
    if (token) {
      try {
        // Verifica e decodifica il token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Recupera le impostazioni dalla tabella
        const settings = await SettingsModel.findOne({
          where: { user_id: decodedToken.userId }
        });
        
        res.json({
          success: true,
          settings: settings ? settings.toJSON() : {}
        });
      } catch (err) {
        // Token non valido
        res.json({
          success: false,
          settings: {},
          message: 'Token non valido'
        });
      }
    } else {
      // Nessun token, utente non autenticato
      res.json({
        success: false,
        settings: {},
        message: 'Utente non autenticato'
      });
    }
  } catch (error) {
    console.error('Errore nel recupero delle impostazioni:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle impostazioni'
    });
  }
});

// API per aggiornare le impostazioni tramite AJAX
app.post('/api/user/settings', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const settingsData = req.body;
    
    // Trova o crea le impostazioni utente
    const [settings, created] = await SettingsModel.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId }
    });
    
    // Aggiorna solo i campi forniti
    await settings.update(settingsData);
    
    res.json({
      success: true,
      settings: settings.toJSON()
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento delle impostazioni'
    });
  }
});

// Aggiungi questo prima del middleware di gestione degli errori database

// Middleware per catturare gli errori non gestiti nelle chiamate API
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Errore API non gestito:', err);
  
  // Indipendentemente dal tipo di errore, renderizza sempre dberror.ejs
  const errorCode = 'API' + Math.floor(1000 + Math.random() * 9000);
  
  return res.status(503).render('dberror', {
    errorDetails: process.env.NODE_ENV === 'development' ? err.message : 'Errore di servizio',
    errorCode
  });
});

// Aggiungi questo middleware per la gestione degli errori di database prima del middleware 500
// Posizionalo prima della gestione degli errori 500 ma dopo tutte le altre route

// Middleware per la gestione degli errori database
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Controlla se è un errore di database (verifica stringhe comuni negli errori MySQL/MariaDB)
  if (err.message && (
      err.message.includes('max_user_connections') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ER_') || // Prefisso comune degli errori MySQL
      err.message.includes('connection') ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ENOTFOUND'
  )) {
    console.error('Errore database:', err);
    
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
    
    // Genera un codice di errore univoco per riferimento
    const errorCode = 'DB' + Math.floor(1000 + Math.random() * 9000);
    
    return res.status(500).render('dberror', {
      user: user,
      errorDetails: process.env.NODE_ENV === 'development' ? err.message : 'Errore di connessione al database',
      errorCode: errorCode
    });
  }
  
  // Se non è un errore di database, passa al prossimo middleware di gestione errori
  next(err);
});

// Aggiungi questo prima della gestione 404 ma dopo tutte le altre route

// Middleware per la gestione degli errori 500
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Errore server:', err);
  
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
  
  // Rendering della pagina 500.ejs con le informazioni necessarie
  res.status(500).render('500', {
    user: user,
    message: err.message || 'Si è verificato un errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    showLogout: !!user  // Mostra il pulsante logout se l'utente è autenticato
  });
});

// Middleware per la gestione degli errori database - MANTIENI SOLO QUESTO
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Controlla se è un errore di database usando la funzione isDbError
  if (isDbError(err)) {
    return handleDbError(err, req, res);
  }
  // Se non è un errore di database, passa al prossimo middleware di gestione errori
  next(err);
});

// Gestione pagina 404 - deve essere sempre l'ultima route
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;