// This file defines the types and interfaces used in the application.

export interface User {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    password: string;
    telefono?: string;
    indirizzo?: string;
    isAdmin: boolean;
    puntifedelta: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Service {
    id: string;
    description: string;
    status: string;
}

export interface Payment {
    id: number;
    amount: number;
    status: string;
}

export interface Order {
    id: number;
    utenteId: number;
    servizio: string;
    stato: 'in-attesa' | 'pagamento-in-attesa' | 'in-lavorazione' | 'completato';
    dataRichiesta: Date;
    dataConsegna?: Date;
    prezzo: number;
    progressoLavoro: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ServiceResponse {
    service: Service;
    message: string;
}

export interface PaymentResponse {
    payment: Payment;
    message: string;
}