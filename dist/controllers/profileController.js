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
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Usa l'asserzione di tipo per accedere a req.user
        const userId = req.user.userId;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        res.render('profile', { user });
    }
    catch (error) {
        console.error('Errore nel recupero del profilo:', error);
        res.status(500).send('Errore nel caricamento del profilo');
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { nome, cognome, telefono, indirizzo, email } = req.body;
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        // Verifica se l'email è già utilizzata da un altro utente
        if (email !== user.email) {
            const existingUser = yield userModel_1.default.findOne({ where: { email } });
            if (existingUser) {
                res.render('profile', {
                    user,
                    errorMessage: 'Email già utilizzata da un altro utente'
                });
                return;
            }
        }
        yield user.update({
            nome,
            cognome,
            email,
            telefono: telefono || null,
            indirizzo: indirizzo || null
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            nome: user.nome,
            cognome: user.cognome,
            isAdmin: user.isAdmin,
            puntifedelta: user.puntifedelta
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: false });
        res.render('profile', {
            user,
            successMessage: 'Profilo aggiornato con successo!'
        });
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento del profilo:', error);
        res.status(500).render('profile', {
            user: req.user,
            errorMessage: 'Errore nell\'aggiornamento del profilo'
        });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res.render('profile', {
                user: req.user,
                errorMessage: 'Le password non corrispondono'
            });
            return;
        }
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            res.status(404).send('Utente non trovato');
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.render('profile', {
                user,
                errorMessage: 'Password attuale non corretta'
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield user.update({ password: hashedPassword });
        res.render('profile', {
            user,
            successMessage: 'Password cambiata con successo!'
        });
    }
    catch (error) {
        console.error('Errore nel cambio password:', error);
        res.status(500).render('profile', {
            user: req.user,
            errorMessage: 'Errore nel cambio password'
        });
    }
});
exports.changePassword = changePassword;
