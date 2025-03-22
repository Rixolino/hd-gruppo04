import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { Op } from 'sequelize';
import { initializeDatabase } from './config/db';
import UserModel from './models/userModel';
import OrderModel from './models/orderModel';
import { authenticate } from './middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import * as profileController from './controllers/profileController';
import * as dashboardController from './controllers/dashboardController';
import bcrypt from 'bcryptjs'; // Aggiungi questo all'inizio del file
import ServiceModel from './models/serviceModel'; // Assicurati di avere il modello ServiceModel
import { loadUserSettings } from './middleware/settingsMiddleware';
import SettingsModel from './models/settingsModel';
import settingsRoutes from './routes/settingsRoutes';
import multer from 'multer';
import PaymentModel, { IPaymentAttributes } from './models/paymentModel'; // Add this line to import PaymentModel
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

// Aggiungi questo middleware dopo le dichiarazioni di app.use ma prima delle definizioni delle route
app.use((req, res, next) => {
  // Imposta valori predefiniti per variabili usate frequentemente nei template
  res.locals.title = 'HelpDigit';
  res.locals.user = req.user || null;
  res.locals.showLogout = !!req.user;
  next();
});

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

// Database connection
initializeDatabase()
    .then(() => {
        console.log('Database and tables created');
    })
    .catch(err => console.log(err));

// Home route - controlla se l'utente è autenticato
app.get('/', async (req: Request, res: Response) => {
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
});

// Dashboard route - UNICA CORRETTA, RIMUOVI LE ALTRE DUE
app.get('/dashboard', authenticate, dashboardController.getDashboard);

// Profile routes
app.get('/profile', authenticate, profileController.getProfile);
app.post('/profile/update', authenticate, profileController.updateProfile);
app.post('/profile/change-password', authenticate, profileController.changePassword);

// Settings route
app.get('/settings', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await UserModel.findByPk(userId);
        
        if (!user) {
            return res.redirect('/auth/login');
        }
        
        res.render('settings', { 
            user: user,
            // Non c'è bisogno di passare userSettings separatamente
            successMessage: req.query.success ? 'Impostazioni salvate con successo!' : undefined,
            errorMessage: req.query.error || undefined
        });
    } catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
        res.status(500).send('Errore nel caricamento delle impostazioni');
    }
});

// Gestione impostazioni di accessibilità
app.post('/settings/accessibility', authenticate, async (req: Request, res: Response) => {
    try {
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
        
        console.log('Impostazioni attuali:', settings);
        
        // Aggiorna le impostazioni
        settings = {
            ...settings,
            fontSize: parseInt(fontSize) || 1,
            highContrast: highContrast === 'on',
            reduceAnimations: reduceAnimations === 'on',
            colorBlindMode: colorBlindMode || 'none'
        };
        
        console.log('Nuove impostazioni:', settings);
        
        // Aggiorna l'utente
        user.settings = settings;
        await user.save();
        
        console.log('Impostazioni salvate con successo');
        res.redirect('/settings?success=Impostazioni di accessibilità salvate con successo#accessibilita');
    } catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#accessibilita');
    }
});

// Gestione impostazioni di personalizzazione
app.post('/settings/personalization', authenticate, async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#personalizzazione');
    }
});

// Gestione impostazioni delle notifiche
app.post('/settings/notifications', authenticate, async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#notifiche');
    }
});

// Gestione impostazioni della privacy
app.post('/settings/privacy', authenticate, async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#privacy');
    }
});

// Download dei dati utente
app.get('/user/download-data', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
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
            },
            // Aggiungi qui altri dati come ordini, pagamenti ecc.
        };
        
        // Imposta gli header per il download del file
        res.setHeader('Content-disposition', 'attachment; filename=i-miei-dati.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify(userData, null, 2));
        res.end();
    } catch (error) {
        console.error('Errore nel download dei dati utente:', error);
        res.status(500).send('Errore nel download dei dati');
    }
});

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
app.get('/services/request/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
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
});

// Route di test per le impostazioni
app.get('/test-settings', authenticate, async (req: Request, res: Response): Promise<void> => {
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
  });

// Route per i dettagli dei servizi specifici - accessibile a tutti
app.get('/services/:id', async (req: Request, res: Response): Promise<void> => {
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

    try {
        // Recupera il servizio dal database
        const service = await ServiceModel.findByPk(serviceId);
        
        if (!service) {
            res.status(404).send('Servizio non trovato');
            return;
        }
        
        // Recupera servizi correlati (esempio: stessa categoria o categorie diverse)
        const relatedServices = await ServiceModel.findAll({
            where: {
                id: { [Op.ne]: serviceId }, // Escludi il servizio corrente
                [Op.or]: [
                    { category: service.category }, // Stessa categoria
                    { category: { [Op.ne]: service.category } } // O categoria diversa
                ]
            },
            limit: 2 // Limita a 2 servizi correlati
        });
        
        // Passa l'oggetto service e relatedServices al template
        res.render('service-detail', { service, relatedServices, user });
    } catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        res.status(500).send('Errore nel recupero del servizio');
    }
});

// Route per ottenere i servizi per la dashboard
app.get('/services/dashboard/services', authenticate, async (req: Request, res: Response) => {
    try {
        const services = await ServiceModel.findAll();
        res.json(services);
    } catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: 'Errore nel recupero dei servizi', error: errorMessage });
    }
});

// API per recuperare i servizi (aggiungi questo codice prima di app.listen)

// API endpoint per ottenere tutti i servizi
app.get('/api/services', async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        res.status(500).json({ 
            message: 'Errore nel recupero dei servizi', 
            error: (error as Error).message 
        });
    }
});

// API endpoint per ottenere un singolo servizio per ID
app.get('/api/services/:id', (req: Request, res: Response) => {
    const serviceId = req.params.id;
    
    ServiceModel.findByPk(serviceId)
        .then(service => {
            if (!service) {
                return res.status(404).json({ message: 'Servizio non trovato' });
            }
            
            res.json(service);
        })
        .catch(error => {
            console.error('Errore nel recupero del servizio:', error);
            res.status(500).json({ 
                message: 'Errore nel recupero del servizio', 
                error: (error as Error).message 
            });
        });
});

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

// Configurazione storage per i file caricati
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Crea la directory se non esiste
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Genera un nome file univoco
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function(req, file, cb) {
    // Filtra i tipi di file accettati
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Formato file non supportato!'));
    }
  }
});

// POST route per la richiesta di servizio
app.post('/services/request/:id', authenticate, upload.array('attachments', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.id;
    const userId = req.user.userId;
    
    // Recupera il servizio dal database
    const service = await ServiceModel.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Pagina non trovata',
        errorMessage: 'La pagina richiesta non è stata trovata',
        showLogout: !!req.user
      });
    }
    
    // Estrai i dati del form
    const {
      requestTitle,
      requestDescription, 
      colorScheme,
      features,
      deadline,
      additionalNotes,
    } = req.body;
    
    // Gestione file allegati
    let attachmentsInfo: { filename: string; originalName: string; path: string; size: number }[] = [];
    if (req.files && Array.isArray(req.files)) {
      attachmentsInfo = (req.files as Express.Multer.File[]).map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
    }
    
    // Crea un nuovo ordine nel database
    const order = await OrderModel.create({
      utenteId: userId,
      servizio: serviceId,
      titolo: requestTitle,
      descrizione: requestDescription,
      dettagliAggiuntivi: JSON.stringify({
        colorScheme,
        features: Array.isArray(features) ? features : features ? [features] : [],
        additionalNotes,
        deadline,
        attachments: attachmentsInfo
      }),
      stato: 'pagamento-in-attesa',
      dataRichiesta: new Date(),
      dataConsegna: undefined,
      prezzo: service.price,
      progressoLavoro: 0
    });
    
    // Notifica agli admin (implementazione base)
    const user = await UserModel.findByPk(userId);
    if (user) {
        console.log(`Nuova richiesta di servizio: ${requestTitle} da ${user.nome} ${user.cognome}`);
    } else {
        console.log(`Nuova richiesta di servizio: ${requestTitle} da un utente sconosciuto`);
    }
    // Qui si potrebbe implementare l'invio di email o altre notifiche
    
    // Reindirizza alla pagina di conferma
    res.redirect(`/order-confirmation/${order.id}`);
  } catch (error) {
    console.error('Errore nella creazione dell\'ordine:', error);
    res.status(500).render('error', {
      user: req.user,
      errorMessage: 'Si è verificato un errore durante l\'elaborazione della richiesta',
      showLogout: true
    });
  }
});

// Rotta per la pagina di conferma dell'ordine
app.get('/order-confirmation/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findByPk(orderId, {
      attributes: ['id', 'utenteId', 'servizio', 'stato', 'dataRichiesta', 'dataConsegna', 'prezzo', 'progressoLavoro', 'createdAt', 'updatedAt']
    });
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato', // Aggiungi il titolo
        errorMessage: 'Ordine non trovato',
        showLogout: true
      });
    }
    
    // Recupera il servizio associato all'ordine
    const service = await ServiceModel.findByPk(order.servizio);
    
    res.render('order-confirmation', {
      user: req.user,
      order,
      service,
      paymentLink: `/payments/${order.id}`,
      title: 'Conferma Ordine' // Aggiungi il titolo
    });
  } catch (error) {
    console.error('Errore nel caricamento della pagina di conferma:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore', // Aggiungi il titolo
      errorMessage: 'Si è verificato un errore nel caricamento della pagina di conferma',
      showLogout: true
    });
  }
});

// Visualizzazione della pagina di pagamento
app.get('/payments/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    
    // Recupera l'ordine
    const order = await OrderModel.findByPk(orderId);
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato',
        errorMessage: 'Ordine non trovato o non autorizzato',
        showLogout: true
      });
    }
    
    // Verifica che l'ordine sia in attesa di pagamento
    if (order.stato !== 'pagamento-in-attesa') {
      return res.redirect(`/orders/${orderId}`);
    }
    
    // Recupera il servizio associato all'ordine
    const service = await ServiceModel.findByPk(order.servizio);
    
    // Renderizza la pagina di pagamento
    res.render('service-payment', {
      user: req.user,
      order,
      service,
      title: 'Pagamento'
    });
  } catch (error) {
    console.error('Errore nel caricamento della pagina di pagamento:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore nel caricamento della pagina di pagamento',
      showLogout: true
    });
  }
});

// Rotta per visualizzare i dettagli dell'ordine
app.get('/orders/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    // Specifica solo le colonne esistenti nel database di produzione
    const order = await OrderModel.findByPk(orderId, {
      attributes: ['id', 'utenteId', 'servizio', 'stato', 'dataRichiesta', 'dataConsegna', 'prezzo', 'progressoLavoro', 'createdAt', 'updatedAt']
    });
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato', // Aggiungi il titolo qui
        errorMessage: 'Ordine non trovato',
        showLogout: true
      });
    }
    
    // Recupera il servizio associato all'ordine
    const service = await ServiceModel.findByPk(order.servizio);
    
    res.render('order-detail', { 
      user: req.user, 
      order, 
      service,
      title: 'Dettaglio Ordine' // Aggiungi il titolo qui
    });
  } catch (error) {
    console.error('Errore nel caricamento dei dettagli dell\'ordine:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore', // Aggiungi il titolo qui
      errorMessage: 'Si è verificato un errore nel caricamento dei dettagli dell\'ordine',
      showLogout: true
    });
  }
});

// Mostra l'anteprima del lavoro completato (Scenario 5)
app.get('/orders/:id/preview', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    
    // Recupera l'ordine con le colonne necessarie
    const order = await OrderModel.findByPk(orderId, {
      attributes: ['id', 'utenteId', 'servizio', 'stato', 'dataRichiesta', 
                  'dataConsegna', 'prezzo', 'progressoLavoro', 'dettagliAggiuntivi', 
                  'createdAt', 'updatedAt']
    });
    
    // Verifica che l'ordine esista e appartenga all'utente autenticato
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato',
        errorMessage: 'Anteprima non disponibile o non autorizzata',
        showLogout: true
      });
    }
    
    // Verifica che l'ordine sia in uno stato appropriato per mostrare l'anteprima
    if (order.stato !== 'completato' && order.stato !== 'in-revisione') {
      return res.status(400).render('error', {
        user: req.user,
        title: 'Anteprima non disponibile',
        errorMessage: 'L\'anteprima è disponibile solo per ordini completati o in fase di revisione',
        showLogout: true
      });
    }
    
    // Recupera il servizio associato all'ordine
    const service = await ServiceModel.findByPk(order.servizio);
    
    if (!service) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Servizio non trovato',
        errorMessage: 'Il servizio associato a questo ordine non è stato trovato',
        showLogout: true
      });
    }
    
    // Recupera informazioni extra come gli allegati o i dettagli della revisione
    let dettagliAggiuntivi = {};
    try {
      if (order.dettagliAggiuntivi) {
        dettagliAggiuntivi = JSON.parse(order.dettagliAggiuntivi);
      }
    } catch (e) {
      console.error('Errore nel parsing dei dettagli aggiuntivi:', e);
    }
    
    // Renderizza la pagina di anteprima del lavoro
    res.render('work-preview', {
      user: req.user,
      order,
      service,
      dettagliAggiuntivi,
      revisioni: service.revisions || 1, // Numero di revisioni disponibili
      dataCompletamento: new Date(), // Data di completamento (simulata)
      title: 'Anteprima Lavoro'
    });
  } catch (error) {
    console.error('Errore nel caricamento dell\'anteprima:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore nel caricamento dell\'anteprima',
      showLogout: true
    });
  }
});

app.post('/process-payment', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    // Recupera l'ordine
    const order = await OrderModel.findByPk(orderId);
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato',
        errorMessage: 'Ordine non trovato o non autorizzato',
        showLogout: true
      });
    }
    
    // Crea un record di pagamento
    const payment = await PaymentModel.create({
      orderId: order.id,
      utenteId: req.user.userId,
      importo: order.prezzo,
      servizio: Number(order.servizio),
      metodo: paymentMethod,
      stato: 'completato',
      riferimento: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    });
    
    // Aggiorna lo stato dell'ordine
    await order.update({
      stato: 'in-lavorazione',
      dataConsegna: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Data di consegna: 7 giorni da oggi
    });
    
    // Reindirizza alla pagina di conferma pagamento
    res.redirect(`/payment-confirmation/${payment.id}`);
  } catch (error) {
    console.error('Errore nell\'elaborazione del pagamento:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore durante l\'elaborazione del pagamento',
      showLogout: true
    });
  }
});

// Elaborazione del pagamento
app.post('/process-payment', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, paymentMethod, bypassPayment } = req.body;
    
    // Recupera l'ordine
    const order = await OrderModel.findByPk(orderId);
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato',
        errorMessage: 'Ordine non trovato o non autorizzato',
        showLogout: true
      });
    }
    
    // Crea un record di pagamento con i campi corretti
    const payment = await PaymentModel.create({
      orderId: order.id,
      utenteId: req.user.userId,
      importo: order.prezzo,
      servizio: Number(order.servizio),
      metodo: paymentMethod,
      stato: 'completato',
      riferimento: 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      dettagli: JSON.stringify({
        simulazione: true,
        timestamp: new Date().toISOString()
      })
    }) as unknown as IPaymentAttributes;
    
    // Aggiorna lo stato dell'ordine
    await order.update({
      stato: 'in-lavorazione',
      dataConsegna: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Data di consegna: 7 giorni da oggi
    });
    
    // Aggiorna i punti fedeltà
    const user = await UserModel.findByPk(req.user.userId);
    if (user) {
      const puntiGuadagnati = Math.floor(Number(order.prezzo));
      await user.update({
        puntifedelta: (user.puntifedelta || 0) + puntiGuadagnati
      });
    }
    
    // Reindirizza alla pagina di conferma pagamento
    res.redirect(`/payment-confirmation/${payment.id}`);
  } catch (error) {
    console.error('Errore nell\'elaborazione del pagamento:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore pagamento',
      errorMessage: 'Si è verificato un errore durante l\'elaborazione del pagamento',
      showLogout: true
    });
  }
});

// Pagina di conferma pagamento
app.get('/payment-confirmation/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const payment = await PaymentModel.findByPk(paymentId) as unknown as IPaymentAttributes;
    
    if (!payment || payment.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Pagamento non trovato',
        errorMessage: 'Pagamento non trovato o non autorizzato',
        showLogout: true
      });
    }
    
    const order = await OrderModel.findByPk(payment.orderId);
    const service = order ? await ServiceModel.findByPk(order.servizio) : null;
    
    res.render('payment-confirmation', {
      user: req.user,
      payment,
      order,
      service,
      title: 'Conferma Pagamento'
    });
  } catch (error) {
    console.error('Errore nel caricamento della conferma pagamento:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore nel caricamento della conferma di pagamento',
      showLogout: true
    });
  }
});

// Rotta per cancellare un ordine
app.post('/orders/:id/cancel', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findByPk(orderId);
    
    if (!order || order.utenteId !== req.user.userId) {
      return res.status(404).render('error', {
        user: req.user,
        title: 'Ordine non trovato',
        errorMessage: 'Ordine non trovato o non autorizzato',
        showLogout: true
      });
    }
    
    // Elimina l'ordine dal database
    await order.destroy();
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Errore nella cancellazione dell\'ordine:', error);
    res.status(500).render('error', {
      user: req.user,
      title: 'Errore',
      errorMessage: 'Si è verificato un errore nella cancellazione dell\'ordine',
      showLogout: true
    });
  }
});


// Gestione pagina 404 - deve essere sempre DOPO tutte le route ma PRIMA dei middleware di gestione errori
app.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    user: req.user,
    title: 'Pagina non trovata',
    errorMessage: 'La pagina richiesta non è stata trovata',
    showLogout: !!req.user
  });
});

// Middleware per intercettare errori specifici di database
const dbErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Controlla se è un errore di database
  if (err.message && (
      err.message.includes('max_user_connections') ||
      err.message.includes('ECONNREFUSED') ||
      err.sqlMessage?.includes('max_user_connections') ||
      err.message.includes('ER_') ||
      err.message.includes('connection') ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ENOTFOUND'
  )) {
    console.error('Errore database:', err);
    
    // Verifica se la richiesta è per un'API
    if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
      res.status(503).json({
        success: false,
        error: 'Servizio temporaneamente non disponibile',
        message: 'Il server è attualmente sovraccarico. Riprova più tardi.'
      });
      return; // Termina l'esecuzione senza restituire nulla
    }
    
    // Genera un codice di errore univoco per riferimento
    const errorCode = 'DB' + Math.floor(1000 + Math.random() * 9000);
    
    res.status(503).render('error', {
      user: req.user || null,
      title: 'Errore di connessione',
      errorMessage: 'Si è verificato un problema di connessione al database. Riprova più tardi.',
      errorCode: errorCode,
      showLogout: !!req.user
    });
    return; // Termina l'esecuzione senza restituire nulla
  }
  
  // Passa al prossimo middleware se non è un errore database
  next(err);
};

// Middleware generale per la gestione degli errori - DEVE ESSERE L'ULTIMO
const generalErrorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Errore dell\'applicazione:', err);
  
  // Verifica se la richiesta è per un'API
  if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    res.status(500).json({
      success: false,
      error: 'Errore del server',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Si è verificato un errore interno'
    });
    return; // Termina l'esecuzione senza restituire nulla
  }
  
  res.status(500).render('error', {
    user: req.user || null,
    title: 'Errore del server',
    errorMessage: 'Si è verificato un errore imprevisto nel server',
    error: process.env.NODE_ENV === 'development' ? err : null,
    showLogout: !!req.user
  });
  // Non è necessario un return qui poiché siamo alla fine della funzione
};

// Registra i middleware dopo la route 404
app.use(dbErrorHandler);
app.use(generalErrorHandler);



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;