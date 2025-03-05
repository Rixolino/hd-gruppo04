// This file defines the types and interfaces used in the application.

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface Service {
    id: string;
    description: string;
    status: string;
}

export interface Payment {
    id: string;
    amount: number;
    status: string;
}

export interface Request {
    userId: string;
    serviceId: string;
    details: string;
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