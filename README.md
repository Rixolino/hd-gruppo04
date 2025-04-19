# HelpDigit
* Strumenti: Vercel (per hosting)
* Linguaggio: TypeScript e varie librerie (+ modelli relazionali) per funzionamento del sito
* Hosting datbase gratuito: Filess.io<br>
N.B per hosting database:  Soluzione gratuita però limitata a 5 connessioni, per questo potrebbe generare (spesso) errori di connessione nel database, quindi aspettare fino a quando si ristabilizza



## Obiettivo Generale
Il progetto mira a fornire una piattaforma digitale che consenta agli utenti di accedere a una vasta gamma di servizi personalizzati, gestire richieste, effettuare pagamenti e monitorare lo stato dei servizi in modo semplice e intuitivo. Il sistema è progettato per garantire un'esperienza utente fluida, accessibile e sicura, con un'interfaccia moderna e funzionalità avanzate per la gestione delle impostazioni e delle preferenze personali.

---

## Scenari Principali

### **Scenario 1: Registrazione e Login**
- **Obiettivo**: Consentire agli utenti di registrarsi e accedere al sistema.
- **Flusso**:
  1. L'utente accede per la prima volta e visualizza una schermata di benvenuto con opzioni per registrarsi o accedere.
  2. Durante la registrazione, l'utente compila un modulo con i propri dati (nome, email, password).
  3. Il backend verifica i dati e salva la registrazione.
  4. Dopo la registrazione, l'utente può effettuare il login e accedere alla dashboard.
- **Risultato**: L'utente è autenticato e può iniziare a utilizzare i servizi.

---

### **Scenario 2: Selezione Servizio**
- **Obiettivo**: Permettere agli utenti di esplorare e selezionare i servizi disponibili.
- **Flusso**:
  1. L'utente accede alla dashboard e visualizza un elenco di servizi disponibili.
  2. Ogni servizio è rappresentato da una scheda con descrizione breve e pulsante "Seleziona".
  3. L'utente seleziona un servizio e accede a un modulo per fornire dettagli aggiuntivi.
- **Risultato**: L'utente ha selezionato un servizio e può procedere con la richiesta.

---

### **Scenario 3: Invio Richiesta Servizio**
- **Obiettivo**: Consentire agli utenti di inviare una richiesta dettagliata per un servizio.
- **Flusso**:
  1. L'utente compila un modulo con i dettagli del servizio richiesto (descrizione, opzioni, note aggiuntive).
  2. Il backend registra la richiesta e notifica il team responsabile.
  3. L'utente riceve una conferma della registrazione della richiesta e visualizza lo stato iniziale ("In lavorazione").
- **Risultato**: La richiesta è stata registrata e il team può iniziare a lavorare.

---

### **Scenario 4: Pagamento**
- **Obiettivo**: Gestire i pagamenti in modo sicuro e trasparente.
- **Flusso**:
  1. L'utente riceve una richiesta di pagamento per il servizio selezionato.
  2. Inserisce i dati di pagamento (carta di credito, PayPal, ecc.) e conferma.
  3. Il backend verifica il pagamento e aggiorna lo stato dell'ordine.
  4. L'utente visualizza una conferma del pagamento con i dettagli della transazione.
- **Risultato**: Il pagamento è stato completato e il servizio può essere avviato.

---

### **Scenario 5: Lavorazione del Servizio**
- **Obiettivo**: Coordinare il team per completare il servizio richiesto.
- **Flusso**:
  1. Il team riceve una notifica per avviare la lavorazione del servizio.
  2. Una volta completato, il backend aggiorna lo stato dell'ordine a "Completato".
  3. L'utente visualizza un'anteprima del lavoro completato.
- **Risultato**: Il servizio è stato completato e l'utente può approvarlo o richiedere modifiche.

---

### **Scenario 6: Modifica del Servizio**
- **Obiettivo**: Consentire agli utenti di approvare o richiedere modifiche al servizio completato.
- **Flusso**:
  1. L'utente visualizza l'anteprima del lavoro e può scegliere di approvarlo o richiedere modifiche.
  2. In caso di approvazione, il backend salva lo stato come "Consegnato" e l'utente riceve il prodotto finale.
  3. In caso di richiesta di modifiche, il backend notifica il team, che aggiorna il lavoro e lo invia nuovamente.
- **Risultato**: L'utente è soddisfatto del servizio ricevuto.

---

### **Scenario 7: Post-Servizio**
- **Obiettivo**: Raccogliere feedback e premiare la fedeltà degli utenti.
- **Flusso**:
  1. Dopo la consegna del servizio, il sistema richiede un feedback all'utente.
  2. L'utente compila un modulo con una valutazione (stelle) e un commento.
  3. Il backend salva il feedback e calcola eventuali punti fedeltà o sconti.
  4. L'utente visualizza un riepilogo dei punti fedeltà e delle offerte disponibili.
- **Risultato**: Il sistema migliora grazie al feedback e incentiva la fedeltà degli utenti.

---

## Conclusione
Lo scopo del progetto è fornire una piattaforma completa e user-friendly per la gestione di servizi digitali, garantendo un'esperienza personalizzata e sicura per gli utenti, e strumenti efficienti per il team responsabile. Ogni scenario è progettato per ottimizzare il flusso di lavoro e migliorare la soddisfazione dell'utente.
