import { Request } from 'express';

// Estendi l'interfaccia Request di Express
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        nome: string;
        cognome: string;
        isAdmin: boolean;
        puntifedelta: number;
      }
    }
  }
}

// Non esportare nulla, è solo una dichiarazione