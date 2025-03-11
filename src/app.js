"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const sequelize_1 = require("sequelize");
const db_1 = require("./config/db");
const userModel_1 = __importDefault(require("./models/userModel"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const profileController = __importStar(require("./controllers/profileController"));
const dashboardController = __importStar(require("./controllers/dashboardController"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Aggiungi questo all'inizio del file
const serviceModel_1 = __importDefault(require("./models/serviceModel")); // Assicurati di avere il modello ServiceModel
const settingsMiddleware_1 = require("./middleware/settingsMiddleware");
const settingsModel_1 = __importDefault(require("./models/settingsModel"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
// Sincronizza il modello con il database (aggiunge le colonne mancanti)
settingsModel_1.default.sync({ alter: true }).then(() => {
    console.log('Tabella settings sincronizzata con il database');
}).catch(error => {
    console.error('Errore nella sincronizzazione della tabella settings:', error);
});
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use((0, cookie_parser_1.default)());
app.use('/img', express_1.default.static(path_1.default.join(__dirname, 'img')));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
// Applica il middleware di impostazioni solo una volta
app.use(settingsMiddleware_1.loadUserSettings);
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
app.use('/auth', authRoutes_1.default);
app.use('/services', serviceRoutes_1.default); // Rimosso authenticate per permettere a tutti di vedere i servizi
app.use('/payments', authMiddleware_1.authenticate, paymentRoutes_1.default);
// Usa solo una volta le routes per settings
app.use('/settings', authMiddleware_1.authenticate, settingsRoutes_1.default);
// Database connection
(0, db_1.initializeDatabase)()
    .then(() => {
    console.log('Database and tables created');
})
    .catch(err => console.log(err));
// Home route - controlla se l'utente è autenticato
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (token) {
        try {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return res.redirect('/dashboard');
        }
        catch (err) {
            res.clearCookie('token');
        }
    }
    // Recupera alcuni servizi da mostrare nella home page
    try {
        const services = yield serviceModel_1.default.findAll({
            limit: 3,
            order: [['createdAt', 'DESC']]
        });
        res.render('index', { services });
    }
    catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        res.render('index', { services: [] });
    }
}));
// Dashboard route
app.get('/dashboard', authMiddleware_1.authenticate, dashboardController.getDashboard);
// Profile routes
app.get('/profile', authMiddleware_1.authenticate, profileController.getProfile);
app.post('/profile/update', authMiddleware_1.authenticate, profileController.updateProfile);
app.post('/profile/change-password', authMiddleware_1.authenticate, profileController.changePassword);
// Settings route
app.get('/settings', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return res.redirect('/auth/login');
        }
        res.render('settings', {
            user: user,
            // Non c'è bisogno di passare userSettings separatamente
            successMessage: req.query.success ? 'Impostazioni salvate con successo!' : undefined,
            errorMessage: req.query.error || undefined
        });
    }
    catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
        res.status(500).send('Errore nel caricamento delle impostazioni');
    }
}));
// Gestione impostazioni di accessibilità
app.post('/settings/accessibility', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Body ricevuto:', req.body);
        const userId = req.user.userId;
        const { fontSize, highContrast, reduceAnimations, colorBlindMode } = req.body;
        console.log('Ricerca utente con ID:', userId);
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            console.log('Utente non trovato');
            return res.redirect('/settings?error=Utente non trovato');
        }
        // Assicurati che settings esista o inizializzalo
        let settings = user.settings || {};
        console.log('Impostazioni attuali:', settings);
        // Aggiorna le impostazioni
        settings = Object.assign(Object.assign({}, settings), { fontSize: parseInt(fontSize) || 1, highContrast: highContrast === 'on', reduceAnimations: reduceAnimations === 'on', colorBlindMode: colorBlindMode || 'none' });
        console.log('Nuove impostazioni:', settings);
        // Aggiorna l'utente
        user.settings = settings;
        yield user.save();
        console.log('Impostazioni salvate con successo');
        res.redirect('/settings?success=Impostazioni di accessibilità salvate con successo#accessibilita');
    }
    catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#accessibilita');
    }
}));
// Gestione impostazioni di personalizzazione
app.post('/settings/personalization', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Body ricevuto:', req.body);
        const userId = req.user.userId;
        const { theme, primaryColor, layout } = req.body;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return res.redirect('/settings?error=Utente non trovato');
        }
        let settings = user.settings || {};
        settings = Object.assign(Object.assign({}, settings), { theme: theme || 'light', primaryColor: primaryColor || 'default', layout: layout || 'default' });
        user.settings = settings;
        yield user.save();
        res.redirect('/settings?success=Personalizzazione salvata con successo#personalizzazione');
    }
    catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#personalizzazione');
    }
}));
// Gestione impostazioni delle notifiche
app.post('/settings/notifications', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Body ricevuto:', req.body);
        const userId = req.user.userId;
        const { emailNotifications, orderUpdates, promotions, newsletter } = req.body;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return res.redirect('/settings?error=Utente non trovato');
        }
        let settings = user.settings || {};
        settings = Object.assign(Object.assign({}, settings), { emailNotifications: emailNotifications === 'on', orderUpdates: orderUpdates === 'on', promotions: promotions === 'on', newsletter: newsletter === 'on' });
        user.settings = settings;
        yield user.save();
        res.redirect('/settings?success=Impostazioni notifiche salvate con successo#notifiche');
    }
    catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#notifiche');
    }
}));
// Gestione impostazioni della privacy
app.post('/settings/privacy', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Body ricevuto:', req.body);
        const userId = req.user.userId;
        const { dataTelemetry, cookies } = req.body;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return res.redirect('/settings?error=Utente non trovato');
        }
        let settings = user.settings || {};
        settings = Object.assign(Object.assign({}, settings), { dataTelemetry: dataTelemetry === 'on', cookies: cookies === 'on' });
        user.settings = settings;
        yield user.save();
        res.redirect('/settings?success=Impostazioni privacy salvate con successo#privacy');
    }
    catch (error) {
        console.error('Errore nel salvataggio delle impostazioni:', error);
        res.redirect('/settings?error=Errore nel salvataggio delle impostazioni#privacy');
    }
}));
// Download dei dati utente
app.get('/user/download-data', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield userModel_1.default.findByPk(userId);
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
    }
    catch (error) {
        console.error('Errore nel download dei dati utente:', error);
        res.status(500).send('Errore nel download dei dati');
    }
}));
// Cancellazione account
app.post('/user/delete-account', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { password } = req.body;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        // Verifica la password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
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
        yield user.save();
        // Oppure per un'eliminazione completa:
        // await user.destroy();
        // Cancella il token di autenticazione
        res.clearCookie('token');
        res.render('account-deleted', {
            message: 'Il tuo account è stato cancellato con successo. Ci dispiace vederti andare!'
        });
    }
    catch (error) {
        console.error('Errore nella cancellazione dell\'account:', error);
        res.status(500).send('Errore nella cancellazione dell\'account');
    }
}));
// Pagine informative - aggiungi user: null per non autenticati
app.get('/about', (req, res) => {
    // Verifica se c'è un utente autenticato
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            // Token non valido, user rimane null
        }
    }
    res.render('about', { user });
});
app.get('/contact', (req, res) => {
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) { }
    }
    res.render('contact', { user });
});
app.get('/faq', (req, res) => {
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) { }
    }
    res.render('faq', { user });
});
app.get('/privacy', (req, res) => {
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) { }
    }
    res.render('privacy', { user });
});
app.get('/terms', (req, res) => {
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) { }
    }
    res.render('terms', { user });
});
app.get('/cookies', (req, res) => {
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) { }
    }
    res.render('cookies', { user });
});
// Route per le richieste di servizi - richiedono autenticazione
app.get('/services/request/:id', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.id;
    try {
        // Recupera il servizio dal database
        const service = yield serviceModel_1.default.findByPk(serviceId);
        if (!service) {
            res.status(404).send('Servizio non trovato');
            return;
        }
        // Passa l'oggetto service E l'utente al template
        res.render('service-request', { service, user: req.user });
    }
    catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        res.status(500).send('Errore nel recupero del servizio');
    }
}));
// Route di test per le impostazioni
app.get('/test-settings', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        console.log('Test settings per userId:', userId);
        const user = yield userModel_1.default.findByPk(userId);
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
    }
    catch (error) {
        console.error('Errore test settings:', error);
        res.json({ error: String(error) });
    }
}));
// Route per i dettagli dei servizi specifici - accessibile a tutti
app.get('/services/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.id;
    // Verifica se c'è un utente autenticato
    const token = req.cookies.token;
    let user = null;
    if (token) {
        try {
            user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            // Token non valido, user rimane null
        }
    }
    try {
        // Recupera il servizio dal database
        const service = yield serviceModel_1.default.findByPk(serviceId);
        if (!service) {
            res.status(404).send('Servizio non trovato');
            return;
        }
        // Recupera servizi correlati (esempio: stessa categoria o categorie diverse)
        const relatedServices = yield serviceModel_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.ne]: serviceId },
                [sequelize_1.Op.or]: [
                    { category: service.category },
                    { category: { [sequelize_1.Op.ne]: service.category } } // O categoria diversa
                ]
            },
            limit: 2 // Limita a 2 servizi correlati
        });
        // Passa l'oggetto service e relatedServices al template
        res.render('service-detail', { service, relatedServices, user });
    }
    catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        res.status(500).send('Errore nel recupero del servizio');
    }
}));
// Route per ottenere i servizi per la dashboard
app.get('/services/dashboard/services', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield serviceModel_1.default.findAll();
        res.json(services);
    }
    catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        const errorMessage = error.message;
        res.status(500).json({ message: 'Errore nel recupero dei servizi', error: errorMessage });
    }
}));
// API per recuperare i servizi (aggiungi questo codice prima di app.listen)
// API endpoint per ottenere tutti i servizi
app.get('/api/services', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, category } = req.query;
        // Costruisci le opzioni di query
        const options = {};
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
        const services = yield serviceModel_1.default.findAll(options);
        // Restituisci i servizi come JSON
        res.json(services);
    }
    catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        res.status(500).json({
            message: 'Errore nel recupero dei servizi',
            error: error.message
        });
    }
}));
// API endpoint per ottenere un singolo servizio per ID
app.get('/api/services/:id', (req, res) => {
    const serviceId = req.params.id;
    serviceModel_1.default.findByPk(serviceId)
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
            error: error.message
        });
    });
});
// Aggiungi questo insieme alle altre route
// Endpoint per testare il salvataggio delle impostazioni
app.post('/test-settings', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { testValue } = req.body;
        // Recupera le impostazioni attuali dalla tabella settings
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId } // Corretto da userId a user_id
        });
        // Restituisci tutte le impostazioni come JSON
        res.json({
            success: true,
            testValue,
            message: 'Test completato con successo',
            settings: settings.toJSON()
        });
    }
    catch (error) {
        console.error('Errore nel test delle impostazioni:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante il test delle impostazioni',
            error: error.message
        });
    }
}));
// Aggiungi questo codice al tuo file app.ts
// API per recuperare le impostazioni utente
app.get('/api/user/settings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica se l'utente è autenticato attraverso il token nei cookie
        const token = req.cookies.token;
        if (token) {
            try {
                // Verifica e decodifica il token
                const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                // Recupera le impostazioni dalla tabella
                const settings = yield settingsModel_1.default.findOne({
                    where: { user_id: decodedToken.userId }
                });
                res.json({
                    success: true,
                    settings: settings ? settings.toJSON() : {}
                });
            }
            catch (err) {
                // Token non valido
                res.json({
                    success: false,
                    settings: {},
                    message: 'Token non valido'
                });
            }
        }
        else {
            // Nessun token, utente non autenticato
            res.json({
                success: false,
                settings: {},
                message: 'Utente non autenticato'
            });
        }
    }
    catch (error) {
        console.error('Errore nel recupero delle impostazioni:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero delle impostazioni'
        });
    }
}));
// API per aggiornare le impostazioni tramite AJAX
app.post('/api/user/settings', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const settingsData = req.body;
        // Trova o crea le impostazioni utente
        const [settings, created] = yield settingsModel_1.default.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        });
        // Aggiorna solo i campi forniti
        yield settings.update(settingsData);
        res.json({
            success: true,
            settings: settings.toJSON()
        });
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'aggiornamento delle impostazioni'
        });
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
exports.default = app;
