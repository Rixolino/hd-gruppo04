document.addEventListener('DOMContentLoaded', function() {
    // Imposta il meta tag viewport per impedire lo zoom sui dispositivi mobili
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
        const newViewportMeta = document.createElement('meta');
        newViewportMeta.name = 'viewport';
        newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(newViewportMeta);
    }

    // Verifica se l'utente è autenticato (controlla se esiste un cookie di autenticazione)
    const isAuthenticated = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    // Log per verificare la presenza del cookie
    // console.log('Cookie:', document.cookie);
    // console.log('Is Authenticated:', isAuthenticated);
    
    // Crea la barra di navigazione
    let navbarLinks;
    
    if (isAuthenticated) {
        // Links per utenti autenticati
        navbarLinks = `
            <li class="nav-item"><a class="nav-link" href="/"><i class="fas fa-home"></i> Home</a></li>
              <li class="nav-item"><a class="nav-link" href="/about"><i class="fas fa-info-circle"></i> Chi Siamo</a></li>
            <li class="nav-item"><a class="nav-link" href="/services"><i class="fas fa-cogs"></i> I Miei Servizi</a></li>
            <li class="nav-item"><a class="nav-link" href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-user-circle"></i> Account
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                    <a class="dropdown-item" href="/profile"><i class="fas fa-id-card"></i> Profilo</a>
                    <a class="dropdown-item" href="/settings"><i class="fas fa-cog"></i> Impostazioni</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item text-danger" href="/auth/logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </li>
        `;
    } else {
        // Links per utenti non autenticati
        navbarLinks = `
            <li class="nav-item"><a class="nav-link" href="/"><i class="fas fa-home"></i> Home</a></li>
            <li class="nav-item"><a class="nav-link" href="/services"><i class="fas fa-cogs"></i> Servizi</a></li>
            <li class="nav-item"><a class="nav-link" href="/about"><i class="fas fa-info-circle"></i> Chi Siamo</a></li>
            <li class="nav-item"><a class="nav-link" href="/contact"><i class="fas fa-envelope"></i> Contatti</a></li>
            <li class="nav-item"><a class="nav-link btn btn-outline-light btn-sm ml-2" href="/auth/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
            <li class="nav-item"><a class="nav-link btn btn-primary btn-sm ml-2" href="/auth/register"><i class="fas fa-user-plus"></i> Registrati</a></li>
        `;
    }
    
    const navbar = `
        <header>
            <!-- Top Bar con contatti e social -->
            
            <!-- Navbar principale -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3 shadow-sm fixed-top">
                <div class="container">
                    <a class="navbar-brand d-flex align-items-center" href="/">
                        <i class="fas fa-laptop-code mr-2 text-primary"></i>
                        <span class="font-weight-bold">Help<span class="text-primary">Digit</span></span>
                    </a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ml-auto">
                            ${navbarLinks}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
        <div style="padding-top: 76px;"></div> <!-- Spazio per compensare la navbar fissa -->
    `;

    // Crea il footer
    const footer = `
        <footer class="bg-dark text-light pt-5 pb-3">
            <div class="container">
                <div class="row">
                    <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <h5 class="text-uppercase font-weight-bold mb-4">
                            <i class="fas fa-laptop-code mr-2 text-primary"></i>HelpDigit
                        </h5>
                        <p>Soluzioni digitali professionali per privati e aziende. Offriamo servizi personalizzati per soddisfare ogni tua esigenza digitale.</p>
                        <div class="mt-4">
                            <a href="#" class="btn btn-outline-primary btn-sm mr-2"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="btn btn-outline-primary btn-sm mr-2"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="btn btn-outline-primary btn-sm mr-2"><i class="fab fa-linkedin-in"></i></a>
                            <a href="https://www.instagram.com/helpdigit/" class="btn btn-outline-primary btn-sm"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <h6 class="text-uppercase font-weight-bold mb-4">Servizi</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="/services/volantini" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Creazione Volantini</a></li>
                            <li class="mb-2"><a href="/services/digitalizzazione" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Digitalizzazione</a></li>
                            <li class="mb-2"><a href="/services/supporto" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Supporto Tecnico</a></li>
                            <li class="mb-2"><a href="/services/consulenza" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Consulenza IT</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <h6 class="text-uppercase font-weight-bold mb-4">Link Utili</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="/about" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Chi Siamo</a></li>
                            <li class="mb-2"><a href="/faq" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>FAQ</a></li>
                            <li class="mb-2"><a href="/privacy" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Privacy Policy</a></li>
                            <li class="mb-2"><a href="/terms" class="text-light"><i class="fas fa-angle-right mr-2 text-primary"></i>Termini e Condizioni</a></li>
                        </ul>
                    </div>
                    <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <h6 class="text-uppercase font-weight-bold mb-4">Contattaci</h6>
                        <p><i class="fas fa-map-marker-alt mr-2 text-primary"></i> Piazza Carlo Poerio, 2, 70126 Bari BA</p>
                        <p><i class="fas fa-envelope mr-2 text-primary"></i> <a href="mailto:helpdigit2025@gmail.com">helpdigit2025@gmail.com</a></p>
                        <p><i class="fas fa-clock mr-2 text-primary"></i> Lun-Ven: 9:00 - 18:00</p>
                    </div>
                </div>
                <hr class="my-4 bg-secondary">
                <div class="row">
                    <div class="col-md-6 text-center text-md-left">
                        <p class="small mb-0">&copy; ${new Date().getFullYear()} HelpDigit. Tutti i diritti riservati.</p>
                    </div>
                    <div class="col-md-6 text-center text-md-right">
                        <p class="small mb-0">
                            <a href="/privacy" class="text-light">Privacy</a> | 
                            <a href="/terms" class="text-light">Termini</a> | 
                            <a href="/cookies" class="text-light">Cookie</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    `;

    // CSS personalizzato
    const customStyles = `
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                padding-top: 0; /* Rimosso il padding che viene aggiunto dal div dopo la navbar */
            }
            .btn-primary {
                background-color: #2563eb;
                border-color: #2563eb;
            }
            .btn-primary:hover {
                background-color: #1d4ed8;
                border-color: #1d4ed8;
            }
            .text-primary {
                color: #2563eb !important;
            }
            .bg-primary {
                background-color: #2563eb !important;
            }
            .navbar-brand {
                font-size: 1.5rem;
            }
            .navbar .nav-link {
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .navbar .nav-link:hover {
                color: #2563eb !important;
            }
            footer a:hover {
                color: #2563eb !important;
                text-decoration: none;
            }
            .navbar.fixed-top {
                transition: transform 0.4s ease;
            }
            /* Classe per nascondere la navbar con una transizione verso l'alto */
            .navbar.fixed-top.navbar-hidden {
                transform: translateY(-100%);
            }
            /* Aggiunge un effetto ombra più pronunciato quando si scrolla */
            .navbar.fixed-top.scrolled {
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
        </style>
    `;

    // Inserisci gli stili personalizzati nella head
    document.head.insertAdjacentHTML('beforeend', customStyles);
    
    // Inserisci la barra di navigazione all'inizio del body
    document.body.insertAdjacentHTML('afterbegin', navbar);
    
    // Inserisci il footer alla fine del body
    document.body.insertAdjacentHTML('beforeend', footer);
    
    // Aggiungi Font Awesome per le icone
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Aggiungi Google Fonts per i caratteri
    if (!document.querySelector('link[href*="fonts.googleapis"]')) {
        const googleFonts = document.createElement('link');
        googleFonts.rel = 'stylesheet';
        googleFonts.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
        document.head.appendChild(googleFonts);
    }
    
    // Gestione dello scroll per mostrare/nascondere la navbar
    let lastScrollTop = 0;
    const navbarHeight = 76; // Altezza approssimativa della navbar in pixel
    
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar.fixed-top');
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Aggiungi effetto ombra quando non si è all'inizio della pagina
        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Determina la direzione dello scroll
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            // Scroll verso il basso & non all'inizio della pagina -> nascondi la navbar
            navbar.classList.add('navbar-hidden');
        } else {
            // Scroll verso l'alto o all'inizio della pagina -> mostra la navbar
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScrollTop = scrollTop;
    });
});