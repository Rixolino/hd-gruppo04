"use strict";
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
exports.getLogout = exports.postRegister = exports.getRegister = exports.postLogin = exports.getLogin = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getLogin = (req, res) => {
    res.render('login');
};
exports.getLogin = getLogin;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ where: { email } });
    if (user && (yield bcrypt_1.default.compare(password, user.password))) {
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            nome: user.nome,
            cognome: user.cognome,
            isAdmin: user.isAdmin,
            puntifedelta: user.puntifedelta
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: false });
        res.redirect('/dashboard');
    }
    else {
        res.redirect('/auth/login');
    }
});
exports.postLogin = postLogin;
const getRegister = (req, res) => {
    res.render('register');
};
exports.getRegister = getRegister;
const postRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Log per debug
    console.log('Dati di registrazione:', req.body);
    // Usa i nomi dei campi esattamente come sono nel form HTML
    const { nome, cognome, email, password, telefono, indirizzo } = req.body;
    try {
        yield userModel_1.default.create({
            nome,
            cognome,
            email,
            password,
            telefono: telefono || null,
            indirizzo: indirizzo || null,
            isAdmin: false,
            puntifedelta: 0,
            isDeleted: false // Aggiungi questa proprietà
        });
        res.redirect('/auth/login?success=true');
    }
    catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.redirect('/auth/register?error=true');
    }
});
exports.postRegister = postRegister;
const getLogout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};
exports.getLogout = getLogout;
