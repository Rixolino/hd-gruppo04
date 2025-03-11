import { Request, Response } from 'express';
import SettingsModel from '../models/settingsModel';
import UserModel from '../models/userModel';
import { Model } from 'sequelize';

// Definisci l'interfaccia per l'utente con le proprietà necessarie
interface UserInstance {
    id: number;
    email: string;
    username?: string; // Rendi username opzionale
    [key: string]: any; // Permetti altre proprietà
}

// Visualizza la pagina impostazioni
export const getSettingsPage = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        
        // Carica le impostazioni dalla tabella settings
        let settings = await SettingsModel.findOne({
            where: { user_id: userId } // Cambiato da userId a user_id
        });
        
        // Se non esistono impostazioni, crea un record vuoto
        if (!settings) {
            settings = await SettingsModel.create({
                user_id: userId // Cambiato da userId a user_id
            });
        }
        
        // Carica l'utente per altre informazioni necessarie
        const userRecord = await UserModel.findByPk(userId);
        
        if (!userRecord) {
            return res.redirect('/auth/login');
        }
        
        // Converti il record utente in un oggetto plain JavaScript
        const user = userRecord.get({ plain: true }) as UserInstance;
        
        // Renderizza la pagina con i dati delle impostazioni
        res.render('settings', {
            user: {
                id: user.id,
                username: user.username || 'User', // Fornisci un valore predefinito
                email: user.email,
                settings: settings.toJSON() // Usa le impostazioni dalla tabella settings
            },
            successMessage: req.query.success ? 'Impostazioni salvate con successo!' : undefined,
            errorMessage: req.query.error ? 'Si è verificato un errore durante il salvataggio.' : undefined
        });
    } catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
        // Invece di renderizzare una vista di errore, reindirizza alla pagina principale con un parametro di errore
        res.redirect('/?error=settings_load_failed');
    }
};

// Aggiorna le impostazioni di accessibilità
export const updateAccessibilitySettings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { fontSize, highContrast, reduceAnimations, colorBlindMode } = req.body;
        
        console.log('Aggiornamento impostazioni accessibilità:', req.body);
        
        // Trova o crea il record delle impostazioni
        const [settings, created] = await SettingsModel.findOrCreate({
            where: { user_id: userId }, // Cambiato da userId a user_id
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        
        // Aggiorna i campi
        await settings.update({
            fontSize: parseInt(fontSize) || 1,
            highContrast: highContrast === 'on',
            reduceAnimations: reduceAnimations === 'on',
            colorBlindMode: colorBlindMode || 'none'
        });
        
        res.redirect('/settings?success=true#accessibilita');
    } catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di accessibilità:', error);
        res.redirect('/settings?error=true#accessibilita');
    }
};

// Aggiorna le impostazioni di personalizzazione
export const updatePersonalizationSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { theme, primaryColor, layout } = req.body;
        
        const [settings, created] = await SettingsModel.findOrCreate({
            where: { user_id: userId }, // Cambiato da userId a user_id
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        
        await settings.update({
            theme: theme || 'light',
            primaryColor: primaryColor || 'default',
            layout: layout || 'default'
        });
        
        res.redirect('/settings?success=true#personalizzazione');
    } catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di personalizzazione:', error);
        res.redirect('/settings?error=true#personalizzazione');
    }
};

// Aggiorna le impostazioni delle notifiche
export const updateNotificationSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { emailNotifications, orderUpdates, promotions, newsletter } = req.body;
        
        const [settings, created] = await SettingsModel.findOrCreate({
            where: { user_id: userId }, // Cambiato da userId a user_id
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        
        await settings.update({
            emailNotifications: emailNotifications === 'on',
            orderUpdates: orderUpdates === 'on',
            promotions: promotions === 'on',
            newsletter: newsletter === 'on'
        });
        
        res.redirect('/settings?success=true#notifiche');
    } catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di notifica:', error);
        res.redirect('/settings?error=true#notifiche');
    }
};

// Aggiorna le impostazioni della privacy
export const updatePrivacySettings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { dataTelemetry, cookies } = req.body;
        
        const [settings, created] = await SettingsModel.findOrCreate({
            where: { user_id: userId }, // Cambiato da userId a user_id
            defaults: { user_id: userId } // Cambiato da userId a user_id
        });
        
        await settings.update({
            dataTelemetry: dataTelemetry === 'on',
            cookies: cookies === 'on'
        });
        
        res.redirect('/settings?success=true#privacy');
    } catch (error) {
        console.error('Errore nell\'aggiornamento delle impostazioni di privacy:', error);
        res.redirect('/settings?error=true#privacy');
    }
};

// Endpoint di test per le impostazioni
export const testSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { testValue } = req.body;
        
        // Recupera le impostazioni attuali dalla tabella settings
        const [settings, created] = await SettingsModel.findOrCreate({
            where: { user_id: userId }, // Cambiato da userId a user_id
            defaults: { user_id: userId } // Cambiato da userId a user_id
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
            error: error instanceof Error ? error.message : String(error) // Gestisci 'error' come 'unknown'
        });
    }
};

