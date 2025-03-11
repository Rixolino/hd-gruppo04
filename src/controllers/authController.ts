import { Request, Response } from 'express';
import UserModel from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getLogin = (req: Request, res: Response) => {
    res.render('login');
};

export const postLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { 
                userId: user.id,  // Assicurati che questo campo sia presente
                nome: user.nome,
                cognome: user.cognome,
                isAdmin: user.isAdmin,
                puntifedelta: user.puntifedelta
            }, 
            process.env.JWT_SECRET!, 
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { httpOnly: false });
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
};

export const getRegister = (req: Request, res: Response) => {
    res.render('register');
};

export const postRegister = async (req: Request, res: Response) => {
    // Log per debug
    console.log('Dati di registrazione:', req.body);

    // Usa i nomi dei campi esattamente come sono nel form HTML
    const { nome, cognome, email, password, telefono, indirizzo } = req.body;
    
    try {
        await UserModel.create({ 
            nome,
            cognome,
            email, 
            password,
            telefono: telefono || null,
            indirizzo: indirizzo || null,
            isAdmin: false,
            puntifedelta: 0,
            isDeleted: false  // Aggiungi questa proprietà
        });
        
        res.redirect('/auth/login?success=true');
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.redirect('/auth/register?error=true');
    }
};

export const getLogout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.redirect('/');
};