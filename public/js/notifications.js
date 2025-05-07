document.addEventListener('DOMContentLoaded', function() {
    // Verifica se l'utente è un admin
    function isUserAdmin() {
        // Verifica dai cookie JWT (funzione già presente in build.js)
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        
        if (cookies.token) {
            try {
                const base64Url = cookies.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                return !!payload.isAdmin;
            } catch (error) {
                console.error('Errore nella decodifica del token:', error);
            }
        }
        
        return false;
    }

    // Solo per gli admin: configura WebSocket per notifiche in tempo reale
    if (isUserAdmin()) {
        // Inizializza il contatore notifiche
        updateNotificationCounter();
        
        // Configura WebSocket
        const socket = io();
        
        // Ascolta l'evento di nuova notifica
        socket.on('newNotification', function(data) {
            // Incrementa il contatore
            incrementNotificationCounter();
            
            // Mostra notifica fluttuante
            showFloatingNotification(data);
        });
    }
    
    // Funzione per aggiornare il contatore delle notifiche
    function updateNotificationCounter() {
        fetch('/admin/notifications/count')
            .then(response => response.json())
            .then(data => {
                const badge = document.querySelector('.navbar-notification-badge');
                if (badge) {
                    if (data.count > 0) {
                        badge.textContent = data.count;
                        badge.classList.remove('d-none');
                    } else {
                        badge.classList.add('d-none');
                    }
                }
            })
            .catch(error => console.error('Errore nel caricamento del contatore notifiche:', error));
    }
    
    // Funzione per incrementare il contatore
    function incrementNotificationCounter() {
        const badge = document.querySelector('.navbar-notification-badge');
        if (badge) {
            let count = parseInt(badge.textContent || '0');
            count += 1;
            badge.textContent = count;
            badge.classList.remove('d-none');
        }
    }
    
    // Funzione per mostrare la notifica fluttuante
    function showFloatingNotification(data) {
        // Crea l'elemento di notifica
        const notification = document.createElement('div');
        notification.className = 'floating-notification';
        
        // Determina icona in base al tipo
        let iconClass = 'fas fa-bell';
        let iconBg = 'bg-info';
        
        if (data.tipo === 'nuovo-ordine') {
            iconClass = 'fas fa-shopping-cart';
            iconBg = 'bg-primary';
        } else if (data.tipo === 'pagamento-ordine') {
            iconClass = 'fas fa-money-bill-wave';
            iconBg = 'bg-success';
        }
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon ${iconBg}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <h6 class="notification-title">${data.tipo.replace('-', ' ').toUpperCase()}</h6>
                    <p class="notification-message">${data.messaggio}</p>
                </div>
                <button class="notification-close" aria-label="Chiudi">×</button>
            </div>
            <div class="notification-actions">
                <a href="/admin/notifications" class="notification-action">Vedi tutte</a>
                <button class="notification-action mark-read" data-id="${data.id}">Segna come letta</button>
            </div>
        `;
        
        // Aggiungi al DOM
        document.body.appendChild(notification);
        
        // Mostra la notifica con animazione
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Chiude la notifica dopo il clic sul pulsante di chiusura
        notification.querySelector('.notification-close').addEventListener('click', function() {
            closeNotification(notification);
        });
        
        // Chiude la notifica quando si clicca "Segna come letta"
        notification.querySelector('.mark-read').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            markNotificationAsRead(id);
            closeNotification(notification);
        });
        
        // Chiude automaticamente la notifica dopo 8 secondi
        setTimeout(() => {
            closeNotification(notification);
        }, 8000);
    }
    
    // Funzione per chiudere la notifica con animazione
    function closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Funzione per segnare la notifica come letta
    function markNotificationAsRead(id) {
        fetch(`/admin/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateNotificationCounter();
            }
        })
        .catch(error => {
            console.error('Errore nel segnare la notifica come letta:', error);
        });
    }
});