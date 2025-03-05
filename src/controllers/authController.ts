import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initializeUserModel, { User } from '../models/userModel';

// Inizializza e ottieni il modello User
const getUserModel = async () => {
  return await initializeUserModel();
};

// Funzioni per l'autenticazione
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const UserModel = await getUserModel();
    
    // Verifica se l'utente esiste già
    const existingUser = await UserModel.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).render('register', { error: 'Username già in uso' });
    }
    
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crea il nuovo utente
    await UserModel.create({
      username,
      password: hashedPassword
    });
    
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).render('register', { error: 'Si è verificato un errore durante la registrazione' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const UserModel = await getUserModel();
    
    // Cerca l'utente nel database
    const user = await UserModel.findOne({ where: { username } });
    if (!user) {
      return res.status(400).render('login', { error: 'Credenziali non valide' });
    }
    
    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.get('password') as string);
    if (!isPasswordValid) {
      return res.status(400).render('login', { error: 'Credenziali non valide' });
    }
    
    // Crea il token JWT
    const token = jwt.sign(
      { id: user.get('id') },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    // Imposta il cookie con il token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000 // 1 ora in millisecondi
    });
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).render('login', { error: 'Si è verificato un errore durante il login' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.redirect('/');
};

// Rendererizzazione delle pagine di autenticazione
export const showLoginForm = (req: Request, res: Response) => {
  res.render('login', { error: null });
};

export const showRegisterForm = (req: Request, res: Response) => {
  res.render('register', { error: null });
};