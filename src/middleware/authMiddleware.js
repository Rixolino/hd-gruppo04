"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/auth/login');
    }
    try {
        // Verifica e decodifica il token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Log per debug
        console.log('Token decodificato:', decoded);
        // Assicurati che userId sia presente nel token decodificato
        if (typeof decoded !== 'string' && !decoded.userId) {
            console.error('Token manca userId:', decoded);
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }
        // Aggiungi i dati dell'utente alla richiesta
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Errore autenticazione:', err);
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};
exports.authenticate = authenticate;
