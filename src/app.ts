import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import initializeDatabase from './config/db';
import initializeUserModel from './models/userModel';
import { authenticate } from './middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';

dotenv.config();

// Importa l'istanza di Sequelize già configurata
import sequelize from './config/db';

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
app.use('/services', authenticate, serviceRoutes);
app.use('/payments', authenticate, paymentRoutes);

// Database connection
const initializeDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connected and synchronized');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

initializeDatabaseConnection()
    .then(() => {
        initializeUserModel(); // Inizializza il modello utente
        console.log('Database and tables created');
    })
    .catch((err: any) => console.log(err));

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

app.get('/about', (req: Request, res: Response) => {
    res.render('about');
});

app.get('/contact', (req: Request, res: Response) => {
    res.render('contact');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});