import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './config/db';
import initializeUserModel from './models/userModel';
import { authenticate } from './middleware/authMiddleware';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);  // Rimosso authenticate per permettere a tutti di vedere i servizi
app.use('/payments', authenticate, paymentRoutes);

// Database connection
initializeDatabase()
    .then(() => {
        initializeUserModel(); // Inizializza il modello utente
        console.log('Database and tables created');
    })
    .catch(err => console.log(err));

// Home route - controlla se l'utente è autenticato
app.get('/', (req: Request, res: Response) => {
    const token = req.cookies.token;
    
    if (token) {
        try {
            // Verifica il token
            jwt.verify(token, process.env.JWT_SECRET!);
            // Se il token è valido, reindirizza alla dashboard
            return res.redirect('/dashboard');
        } catch (err) {
            // Se il token non è valido, cancella il cookie e mostra la home
            res.clearCookie('token');
        }
    }
    
    // Se non c'è token o non è valido, mostra la pagina index
    res.render('index');
});

// Dashboard route
app.get('/dashboard', authenticate, (req: Request, res: Response) => {
    res.render('dashboard');
});

// Profile route
app.get('/profile', authenticate, (req: Request, res: Response) => {
    res.render('profile');
});

// Settings route
app.get('/settings', authenticate, (req: Request, res: Response) => {
    res.render('settings');
});

// Pagine informative
app.get('/about', (req: Request, res: Response) => {
    res.render('about');
});

app.get('/contact', (req: Request, res: Response) => {
    res.render('contact');
});

app.get('/faq', (req: Request, res: Response) => {
    res.render('faq');
});

app.get('/privacy', (req: Request, res: Response) => {
    res.render('privacy');
});

app.get('/terms', (req: Request, res: Response) => {
    res.render('terms');
});

app.get('/cookies', (req: Request, res: Response) => {
    res.render('cookies');
});

// Route per i dettagli dei servizi specifici
app.get('/services/:id', (req: Request, res: Response) => {
    const serviceId = req.params.id;
    let service;
    let relatedServices = [];

    // Recupera il servizio in base all'ID
    switch(serviceId) {
        case 'digitalizzazione':
            service = {
                id: 'digitalizzazione',
                name: 'Digitalizzazione Documenti',
                description: 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.',
                price: 49.90,
                category: 'Digitalizzazione',
                icon: 'fa-file-import',
                deliveryTime: '3-5 giorni lavorativi',
                revisions: '1 revisione gratuita'
            };
            relatedServices = [
                {
                    id: 'volantini',
                    name: 'Creazione Volantini',
                    description: 'Design professionale di volantini pubblicitari per la tua attività.',
                    price: 39.90,
                    category: 'Grafica',
                    icon: 'fa-paint-brush'
                },
                {
                    id: 'supporto',
                    name: 'Supporto PC Remoto',
                    description: 'Assistenza tecnica a distanza per risolvere problemi informatici.',
                    price: 29.90,
                    category: 'Supporto',
                    icon: 'fa-headset'
                }
            ];
            break;
        // Aggiungi altri casi per altri servizi
        default:
            res.status(404).send('Servizio non trovato');
            return;
    }

    // Passa l'oggetto service e relatedServices al template
    res.render('service-detail', { service, relatedServices });
});

// Route per le richieste di servizi - richiedono autenticazione
app.get('/services/request/:id', authenticate, (req: Request, res: Response) => {
    // Recupera il servizio richiesto in base all'ID
    const serviceId = req.params.id;
    
    // Oggetto generico per i dati del servizio
    let service;
    
    // Recupera il servizio in base all'ID
    switch(serviceId) {
        case 'digitalizzazione':
            service = {
                id: 'digitalizzazione',
                name: 'Digitalizzazione Documenti',
                description: 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.',
                price: 49.90,
                category: 'Digitalizzazione',
                icon: 'fa-file-import',
                deliveryTime: '3-5 giorni lavorativi',
                revisions: '1 revisione gratuita'
            };
            break;
        case 'volantini':
            service = {
                id: 'volantini',
                name: 'Creazione Volantini',
                description: 'Design professionale di volantini pubblicitari per la tua attività.',
                price: 39.90,
                category: 'Grafica',
                icon: 'fa-paint-brush',
                deliveryTime: '3-4 giorni lavorativi',
                revisions: '2 revisioni gratuite'
            };
            break;
        case 'supporto':
            service = {
                id: 'supporto',
                name: 'Supporto PC Remoto',
                description: 'Assistenza tecnica a distanza per risolvere problemi informatici.',
                price: 29.90,
                category: 'Supporto',
                icon: 'fa-headset',
                deliveryTime: '24-48 ore',
                revisions: 'Supporto continuo'
            };
            break;
        case 'sitobase':
            service = {
                id: 'sitobase',
                name: 'Sito Web Base',
                description: 'Creazione di un sito web professionale fino a 5 pagine.',
                price: 299.90,
                category: 'Web',
                icon: 'fa-laptop-code',
                deliveryTime: '7-10 giorni lavorativi',
                revisions: '3 revisioni gratuite'
            };
            break;
        case 'biglietti':
            service = {
                id: 'biglietti',
                name: 'Biglietti da Visita',
                description: 'Design professionale di biglietti da visita personalizzati.',
                price: 24.90,
                category: 'Grafica',
                icon: 'fa-id-card',
                deliveryTime: '2-3 giorni lavorativi',
                revisions: '2 revisioni gratuite'
            };
            break;
        case 'smartphone':
            service = {
                id: 'smartphone',
                name: 'Configurazione Smartphone',
                description: 'Assistenza per la configurazione completa del tuo nuovo smartphone.',
                price: 34.90,
                category: 'Supporto',
                icon: 'fa-mobile-alt',
                deliveryTime: '24 ore',
                revisions: 'Supporto post-configurazione'
            };
            break;
        default:
            // Modifica questa parte per non restituire un valore
            res.status(404).send('Servizio non trovato');
            return; // Aggiungi un return vuoto qui per terminare l'esecuzione
    }
    
    // Passa l'oggetto service al template
    res.render('service-request', { service });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});