/**
 * Sistema di notifiche in tempo reale per gli amministratori
 */
(function() {
    // Verifica se l'utente è admin
    if (!document.body.classList.contains('admin-view')) return;
    
    // Carica Socket.IO se non è già caricato
    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
        script.onload = initNotifications;
        document.head.appendChild(script);
    } else {
        initNotifications();
    }
    
    function initNotifications() {
        // Connessione a Socket.IO
        const socket = io();
        
        // Recupera il token dai cookie
        function getToken() {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith('token=')) {
                    return cookie.substring(6);
                }
            }
            return null;
        }
        
        // Autentica il socket
        const token = getToken();
        if (token) {
            socket.emit('authenticate', { token });
            
            socket.on('authenticated', () => {
                console.log('Socket.IO autenticato con successo');
                
                // Ascolta nuove notifiche
                socket.on('nuova_notifica', (data) => {
                    console.log('Nuova notifica ricevuta:', data);
                    showNotificationPopup(data.notifica);
                    updateNotificationCounter(1);
                });
            });
            
            socket.on('authentication_error', (error) => {
                console.error('Errore autenticazione Socket.IO:', error);
            });
        }
    }
    
    // Mostra una notifica fluttuante
    function showNotificationPopup(notifica) {
        // Crea container se non esiste
        let container = document.getElementById('admin-notification-popups');
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-notification-popups';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            container.style.maxWidth = '350px';
            document.body.appendChild(container);
        }
        
        // Determina il colore in base al tipo
        let bgColor = '#3498db'; // Default blu
        let icon = 'bell';
        if (notifica.tipo === 'nuovo-ordine') {
            bgColor = '#2980b9';
            icon = 'shopping-cart';
        } else if (notifica.tipo === 'pagamento-ordine') {
            bgColor = '#27ae60';
            icon = 'money-bill-wave';
        }
        
        // Crea la notifica
        const popup = document.createElement('div');
        popup.className = 'admin-notification-popup';
        popup.style.backgroundColor = 'white';
        popup.style.color = '#333';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        popup.style.padding = '16px';
        popup.style.marginBottom = '10px';
        popup.style.position = 'relative';
        popup.style.borderLeft = `5px solid ${bgColor}`;
        popup.style.animation = 'slideInRight 0.3s forwards, fadeOut 0.3s 9.7s forwards';
        popup.setAttribute('data-notification-id', notifica.id);
        
        if (!document.getElementById('notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }
        
        popup.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="background-color: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <i class="fas fa-${icon}" style="color: white; font-size: 14px;"></i>
                </div>
                <div style="font-weight: bold;">${notifica.tipo.replace('-', ' ').toUpperCase()}</div>
                <button class="close-btn" style="margin-left: auto; background: none; border: none; cursor: pointer; font-size: 16px; color: #999;">&times;</button>
            </div>
            <p style="margin: 0 0 8px 0;">${notifica.messaggio}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <small style="color: #777;">${new Date(notifica.data).toLocaleTimeString()}</small>
                <div>
                    ${notifica.entityType === 'ordine' && notifica.entityId ? 
                      `<a href="/admin/orders?id=${notifica.entityId}" class="btn btn-sm btn-outline-secondary mr-2" style="font-size: 12px;">
                          <i class="fas fa-eye"></i> Visualizza
                      </a>` : ''}
                    <button class="btn btn-sm btn-outline-success mark-read-btn" data-id="${notifica.id}" style="font-size: 12px;">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Aggiungi la notifica all'inizio del container
        container.appendChild(popup);
        
        // Riproduce suono di notifica
        playNotificationSound();
        
        // Gestione eventi
        popup.querySelector('.close-btn').addEventListener('click', () => {
            popup.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => popup.remove(), 300);
        });
        
        popup.querySelector('.mark-read-btn').addEventListener('click', () => {
            markNotificationAsRead(notifica.id);
            popup.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => popup.remove(), 300);
        });
        
        // Rimuovi dopo 10 secondi
        setTimeout(() => {
            if (popup.parentNode) {
                popup.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => popup.remove(), 300);
            }
        }, 10000);
    }
    
    // Segna una notifica come letta
    function markNotificationAsRead(id) {
        fetch(`/api/admin/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateNotificationCounter(-1);
            }
        })
        .catch(error => console.error('Errore nel segnare la notifica come letta:', error));
    }
    
    // Aggiorna il contatore di notifiche nella navbar
    function updateNotificationCounter(delta) {
        // Cerca il badge nella navbar
        const navBadge = document.querySelector('.nav-link .badge');
        if (navBadge) {
            const currentCount = parseInt(navBadge.textContent || '0');
            const newCount = Math.max(0, currentCount + delta);
            
            if (newCount > 0) {
                navBadge.textContent = newCount;
                navBadge.style.display = '';
            } else {
                navBadge.style.display = 'none';
            }
        }
    }
    
    // Riproduce un suono di notifica
    function playNotificationSound() {
        let sound = document.getElementById('notification-sound');
        if (!sound) {
            sound = document.createElement('audio');
            sound.id = 'notification-sound';
            sound.src = '/sounds/notification.mp3';
            sound.volume = 0.5;
            document.body.appendChild(sound);
        }
        sound.play().catch(e => console.log('Impossibile riprodurre audio:', e));
    }
})();