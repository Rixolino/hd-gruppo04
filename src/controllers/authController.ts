import { Request, Response } from 'express';
import initializeUserModel from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let User: any;

initializeUserModel().then((model) => {
    User = model;
});

export const getLogin = (req: Request, res: Response) => {
    res.render('login');
};

export const postLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: false }); // Rimuovi HttpOnly per consentire l'accesso dal client
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
};

export const getRegister = (req: Request, res: Response) => {
    res.render('register');
};

export const postRegister = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await User.create({ name, email, password: hashedPassword });
        res.redirect('/auth/login');
    } catch (error) {
        res.status(400).send('Errore durante la registrazione');
    }
};

// Aggiunta della funzione di logout
export const getLogout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.redirect('/');
};