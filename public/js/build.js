// Rilevamento e supporto per browser Tizen
(function() {
    // Funzione per rilevare il browser Tizen
    function isTizenBrowser() {
        return /Tizen/.test(navigator.userAgent) || 
               /SMART-TV/.test(navigator.userAgent) || 
               /SmartTV/.test(navigator.userAgent);
    }
    
    // Funzione per ottimizzare le prestazioni su Tizen
    function optimizeForTizen() {
        console.log('Browser Tizen rilevato. Applicazione ottimizzazioni...');
        
        // Imposta flag globale
        window.isTizenDevice = true;
        
        // Aggiungi classe al body per stili specifici
        document.documentElement.classList.add('tizen-browser');
        
        // Polyfill per funzionalità mancanti nei browser Tizen
        // Array.from polyfill
        if (!Array.from) {
            Array.from = function(arrayLike) {
                return [].slice.call(arrayLike);
            };
        }
        
        // Promise polyfill (versione semplificata)
        if (!window.Promise) {
            window.Promise = function(executor) {
                this.then = function() { return this; };
                this.catch = function() { return this; };
                try { executor(function(){}, function(){}); } catch(e) {}
            };
            window.Promise.resolve = function() { return new window.Promise(function(){}); };
            window.Promise.reject = function() { return new window.Promise(function(){}); };
            window.Promise.all = function() { return new window.Promise(function(){}); };
        }
        
        // NodeList.forEach polyfill
        if (window.NodeList && !NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
        
        // Fetch API polyfill (versione semplificata)
        if (!window.fetch) {
            window.fetch = function(url, options) {
                return new Promise(function(resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open((options && options.method) || 'GET', url);
                    
                    if (options && options.headers) {
                        for (var header in options.headers) {
                            xhr.setRequestHeader(header, options.headers[header]);
                        }
                    }
                    
                    xhr.onload = function() {
                        var response = {
                            ok: xhr.status >= 200 && xhr.status < 300,
                            status: xhr.status,
                            statusText: xhr.statusText,
                            json: function() { return Promise.resolve(JSON.parse(xhr.responseText)); },
                            text: function() { return Promise.resolve(xhr.responseText); }
                        };
                        resolve(response);
                    };
                    
                    xhr.onerror = function() {
                        reject(new Error('Network request failed'));
                    };
                    
                    xhr.send((options && options.body) || null);
                });
            };
        }

        // Ottimizza animazioni e transizioni
        var styleEl = document.createElement('style');
        styleEl.innerHTML = `
            /* Stili ottimizzati per Tizen */
            .tizen-browser * {
                transition-duration: 0.1s !important;
                animation-duration: 0.1s !important;
            }
            .tizen-browser .smart-navbar {
                background-color: var(--navbar-solid) !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }
            .tizen-browser .progress-bar,
            .tizen-browser .btn-glow:before {
                animation: none !important;
            }
            .tizen-browser .shadow,
            .tizen-browser .shadow-sm,
            .tizen-browser .shadow-lg {
                box-shadow: none !important;
            }
            /* Disabilita effetti che potrebbero causare problemi */
            .tizen-browser .dropdown-menu,
            .tizen-browser .modal-content {
                animation: none !important;
                transition: none !important;
            }
            /* Semplificazioni per migliorare le prestazioni */
            .tizen-browser .card {
                border: 1px solid rgba(0,0,0,0.125) !important;
                box-shadow: none !important;
            }
            .tizen-browser img {
                max-width: 100% !important;
                height: auto !important;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Disabilita AOS per Tizen
        window.AOS = {
            init: function() {},
            refresh: function() {},
            refreshHard: function() {}
        };
        
        // Semplifica il caricamento delle immagini
        window.addEventListener('DOMContentLoaded', function() {
            // Carica le immagini in modo progressivo
            var images = document.querySelectorAll('img');
            for (var i = 0; i < images.length; i++) {
                images[i].loading = 'lazy';
                
                // Rimuovi gli effetti dalle immagini
                images[i].style.transition = 'none';
                images[i].classList.remove('fade-in', 'animate');
            }
            
            // Ottimizza gli event listener
            simplifyEventListeners();
        });
    }
    
    // Semplifica gli event listener per migliorare le prestazioni
    function simplifyEventListeners() {
        // Per Tizen usiamo un solo handler per lo scroll invece di molti
        var lastScrollPos = window.pageYOffset;
        var scrollHandlers = [];
        
        // Sostituisci tutti gli event listener di scroll esistenti
        window.addEventListener('scroll', debounce(function() {
            var currentScrollPos = window.pageYOffset;
            var scrollDirection = currentScrollPos > lastScrollPos ? 'down' : 'up';
            var scrollData = {
                position: currentScrollPos,
                direction: scrollDirection
            };
            
            // Navbar semplificata per Tizen
            var navbar = document.querySelector('.smart-navbar');
            if (navbar) {
                if (currentScrollPos > 10) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            lastScrollPos = currentScrollPos;
        }, 100));
        
        // Funzione di debounce per limitare le chiamate frequenti
        function debounce(func, wait) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        }
    }
    
    // Esegui rilevamento e ottimizzazione
    if (isTizenBrowser()) {
        // Applica le ottimizzazioni prima del caricamento completo
        optimizeForTizen();
    }
})();

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

    // Gestione dinamica delle immagini con fallback per diversi ambienti
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.onerror = function() {
        // Se l'immagine non si carica, prova un percorso alternativo
        const currentSrc = this.src;
        console.log('Errore caricamento immagine:', currentSrc);
        
        // Prova a correggere il percorso
        if (currentSrc.includes('/img/')) {
          this.src = currentSrc.replace('/img/', '/public/img/');
          console.log('Tentativo con percorso alternativo:', this.src);
          
          // Se anche questo fallisce, usa un'immagine placeholder
          this.onerror = function() {
            console.log('Fallimento anche con percorso alternativo, uso placeholder');
            this.src = 'https://via.placeholder.com/300x200?text=Immagine+non+disponibile';
            this.onerror = null; // Previene ricorsione infinita
          };
        } else if (currentSrc.includes('src/img/')) {
          this.src = currentSrc.replace('src/img/', '/img/');
          console.log('Tentativo con percorso di produzione:', this.src);
          
          this.onerror = function() {
            this.src = 'https://via.placeholder.com/300x200?text=Immagine+non+disponibile';
            this.onerror = null;
          };
        } else {
          this.src = 'https://via.placeholder.com/300x200?text=Immagine+non+disponibile';
          console.log('Uso placeholder diretto');
        }
      };
    });

    // Verifica se l'utente è autenticato (controlla se esiste un cookie di autenticazione)
    const isAuthenticated = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    // Variabile per memorizzare le impostazioni dell'utente
    let userSettings = {
        theme: 'light',
        fontSize: 1,
        highContrast: false,
        reduceAnimations: false,
        colorBlindMode: 'none',
        primaryColor: 'default',
        layout: 'default'
    };
    
    // Funzione per applicare le impostazioni utente
    function applyUserSettings(settings) {
        if (!settings) return;
        
        console.log('Applicazione impostazioni utente:', settings);
        
        // Applica il tema con effetto di transizione
        document.body.classList.add('theme-transition');
        
        // TEMA
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.documentElement.setAttribute('data-theme', 'dark');
            updateElementsForDarkTheme();
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.setAttribute('data-theme', 'light');
            updateElementsForLightTheme();
        }
        
        // DIMENSIONE FONT
        // Prima rimuovi tutte le classi di dimensione del font
        document.body.classList.remove('font-size-1', 'font-size-2', 'font-size-3');
        // Poi aggiungi la classe appropriata
        if (settings.fontSize) {
            document.body.classList.add('font-size-' + settings.fontSize);
            console.log('Dimensione font impostata:', settings.fontSize);
        } else {
            // Valore predefinito se non specificato
            document.body.classList.add('font-size-1');
        }
        
        // CONTRASTO ELEVATO
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
            console.log('Contrasto elevato attivato');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // RIDUZIONE ANIMAZIONI
        if (settings.reduceAnimations) {
            document.body.classList.add('reduce-animations');
            // Disabilita anche la libreria AOS se presente
            if (window.AOS) {
                window.AOS.init({ disable: true });
            }
            console.log('Animazioni ridotte attivate');
        } else {
            document.body.classList.remove('reduce-animations');
            // Riattiva AOS se presente
            if (window.AOS) {
                window.AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true
                });
            }
        }
        
        // MODALITÀ DALTONICO
        // Rimuovi prima tutte le classi di daltonismo
        document.body.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
        if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
            document.body.classList.add('colorblind-' + settings.colorBlindMode);
            console.log('Modalità daltonico attivata:', settings.colorBlindMode);
        }
        
        // COLORE PRIMARIO
        // Rimuovi prima tutte le classi di colore
        document.body.classList.remove('color-blue', 'color-green', 'color-purple', 'color-orange', 'color-red');
        if (settings.primaryColor && settings.primaryColor !== 'default') {
            document.body.classList.add('color-' + settings.primaryColor);
            document.documentElement.style.setProperty('--primary-color', getColorValue(settings.primaryColor));
            console.log('Colore primario impostato:', settings.primaryColor);
        } else {
            document.documentElement.style.setProperty('--primary-color', getColorValue('default'));
        }
        
        // LAYOUT
        // Rimuovi prima tutte le classi di layout
        document.body.classList.remove('layout-compact', 'layout-comfortable', 'layout-spacious');
        if (settings.layout && settings.layout !== 'default') {
            document.body.classList.add('layout-' + settings.layout);
            console.log('Layout impostato:', settings.layout);
        }
        
        // Rimuovi la classe di transizione dopo che l'animazione è completata
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
        
        // Forza il ridisegno di componenti specifici che potrebbero richiedere aggiornamenti
        updateComponentsForTheme(settings.theme);
    }
    
    // Funzione principale per aggiornare tutti gli elementi in base al tema
    function applyThemeToAllElements(theme) {
        const isDark = theme === 'dark';
        
        // Imposta gli attributi data-* sul body per il CSS
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Aggiorna le icone
        updateIconsForTheme(isDark);
        
        // Aggiorna i colori dei testi
        updateTextColors(isDark);
        
        // Aggiorna i componenti di navigazione
        updateNavigationElements(isDark);
        
        // Aggiorna i componenti di contenuto
        updateContentElements(isDark);
        
        // Aggiorna i componenti di form e input
        updateFormElements(isDark);
        
        // Aggiorna i componenti interattivi
        updateInteractiveElements(isDark);
        
        // Aggiorna tabelle e dati
        updateTableElements(isDark);
        
        // Aggiorna grafici e visualizzazioni
        updateChartElements(isDark);
        
        // Aggiorna immagini in base al tema
        updateImages(isDark);
        
        // Aggiorna gli elementi di stile
        updateStylingElements(isDark);
        
        // Aggiorna componenti specifici del progetto
        updateProjectSpecificElements(isDark);
        
        // Emetti un evento per far sapere ad altri script che il tema è cambiato
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: isDark ? 'dark' : 'light' }
        }));
    }
    
    // Aggiorna le icone in base al tema
    function updateIconsForTheme(isDark) {
        // Icone Font Awesome
        document.querySelectorAll('.fa, .fas, .far, .fab, .fal').forEach(icon => {
            if (isDark) {
                // Aumenta la luminosità per alcune icone nel tema scuro
                if (icon.classList.contains('text-muted') || 
                    icon.classList.contains('text-secondary')) {
                    icon.style.color = '#a0a0a0';
                }
            } else {
                // Ripristina il colore originale
                icon.style.color = '';
            }
        });
        
        // Icone con classi tema-specifiche
        document.querySelectorAll('.theme-icon').forEach(icon => {
            if (isDark) {
                icon.classList.remove('theme-icon-light');
                icon.classList.add('theme-icon-dark');
            } else {
                icon.classList.remove('theme-icon-dark');
                icon.classList.add('theme-icon-light');
            }
        });
        
        // Icone nei servizi
        document.querySelectorAll('.service-card .rounded-circle, .card i.text-primary').forEach(icon => {
            if (isDark) {
                icon.classList.add('icon-dark');
            } else {
                icon.classList.remove('icon-dark');
            }
        });
    }
    
    // Aggiorna i colori dei testi
    function updateTextColors(isDark) {
        // Titoli e sottotitoli
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(header => {
            if (!header.classList.contains('text-white') && !header.classList.contains('text-light')) {
                if (isDark) {
                    header.classList.add('text-light-theme');
                } else {
                    header.classList.remove('text-light-theme');
                }
            }
        });
        
        // Testo primario e muted
        document.querySelectorAll('.text-primary, .text-muted, .lead').forEach(text => {
            if (isDark && text.classList.contains('text-muted')) {
                text.dataset.originalColor = text.style.color || '';
                text.style.color = '#a6a6a6';
            } else if (!isDark && text.dataset.originalColor) {
                text.style.color = text.dataset.originalColor;
                delete text.dataset.originalColor;
            }
        });
        
        // Link non-bottoni
        document.querySelectorAll('a:not(.btn):not(.nav-link)').forEach(link => {
            if (isDark) {
                link.classList.add('link-light-theme');
            } else {
                link.classList.remove('link-light-theme');
            }
        });
    }
    
    // Aggiorna i componenti di navigazione
    function updateNavigationElements(isDark) {
        // Navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (isDark) {
                navbar.classList.remove('navbar-light');
                navbar.classList.add('navbar-dark');
            } else {
                navbar.classList.remove('navbar-dark');
                if (!navbar.classList.contains('smart-navbar')) {
                    navbar.classList.add('navbar-light');
                }
            }
        }
        
        // Breadcrumbs
        document.querySelectorAll('.breadcrumb').forEach(breadcrumb => {
            if (isDark) {
                breadcrumb.classList.add('breadcrumb-dark');
            } else {
                breadcrumb.classList.remove('breadcrumb-dark');
            }
        });
        
        // Tabs e pills
        document.querySelectorAll('.nav-tabs, .nav-pills').forEach(nav => {
            if (isDark) {
                nav.classList.add('nav-dark');
            } else {
                nav.classList.remove('nav-dark');
            }
        });
    }
    
    // Aggiorna i componenti di contenuto
    function updateContentElements(isDark) {
        // Card
        document.querySelectorAll('.card').forEach(card => {
            if (isDark) {
                card.classList.add('card-dark');
                // Aggiungi effetto bordo leggero per card nel tema scuro
                if (!card.style.borderColor) {
                    card.style.borderColor = 'rgba(255, 255, 255, 0.125)';
                }
            } else {
                card.classList.remove('card-dark');
                if (card.style.borderColor === 'rgba(255, 255, 255, 0.125)') {
                    card.style.borderColor = '';
                }
            }
        });
        
        // Card headers e footers
        document.querySelectorAll('.card-header, .card-footer').forEach(element => {
            if (isDark) {
                element.classList.add('bg-dark-subtle');
                element.style.borderColor = 'rgba(255, 255, 255, 0.125)';
            } else {
                element.classList.remove('bg-dark-subtle');
                element.style.borderColor = '';
            }
        });
        
        // List groups
        document.querySelectorAll('.list-group-item').forEach(item => {
            if (isDark) {
                item.classList.add('list-group-item-dark');
            } else {
                item.classList.remove('list-group-item-dark');
            }
        });
        
        // Jumbotron e alert
        document.querySelectorAll('.jumbotron, .alert').forEach(element => {
            if (isDark && !element.classList.contains('alert-success') && 
                !element.classList.contains('alert-danger') && 
                !element.classList.contains('alert-warning') && 
                !element.classList.contains('alert-info')) {
                element.classList.add('bg-dark-subtle');
            } else if (!isDark) {
                element.classList.remove('bg-dark-subtle');
            }
        });
        
        // Badge
        document.querySelectorAll('.badge').forEach(badge => {
            // Non modificare badge con classi di colore specifiche
            if (!badge.classList.contains('badge-primary') && 
                !badge.classList.contains('badge-secondary') && 
                !badge.classList.contains('badge-success') && 
                !badge.classList.contains('badge-danger') && 
                !badge.classList.contains('badge-warning') && 
                !badge.classList.contains('badge-info')) {
                if (isDark) {
                    badge.classList.add('badge-dark-theme');
                } else {
                    badge.classList.remove('badge-dark-theme');
                }
            }
        });
        
        // Timeline (visto in service-detail.ejs)
        document.querySelectorAll('.timeline-content').forEach(item => {
            if (isDark) {
                item.style.borderLeftColor = '#444';
            } else {
                item.style.borderLeftColor = '#e9ecef';
            }
        });
    }
    
    // Aggiorna i componenti di form e input
    function updateFormElements(isDark) {
        // Form controls
        document.querySelectorAll('.form-control, .custom-select, .custom-file-label').forEach(input => {
            if (isDark) {
                input.classList.add('form-control-dark');
            } else {
                input.classList.remove('form-control-dark');
            }
        });
        
        // Input groups
        document.querySelectorAll('.input-group-text').forEach(text => {
            if (isDark) {
                text.classList.add('input-group-text-dark');
            } else {
                text.classList.remove('input-group-text-dark');
            }
        });
        
        // Custom controls (checkboxes, radios)
        document.querySelectorAll('.custom-control-label').forEach(label => {
            if (isDark) {
                label.classList.add('custom-control-label-dark');
            } else {
                label.classList.remove('custom-control-label-dark');
            }
        });
    }
    
    // Aggiorna i componenti interattivi
    function updateInteractiveElements(isDark) {
        // Modali
        document.querySelectorAll('.modal, .modal-content').forEach(modal => {
            if (isDark) {
                modal.classList.add('modal-dark');
            } else {
                modal.classList.remove('modal-dark');
            }
        });
        
        // Dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (isDark) {
                menu.classList.add('dropdown-menu-dark');
            } else {
                menu.classList.remove('dropdown-menu-dark');
            }
        });
        
        // Tooltips e popovers
        if (window.bootstrap) {
            if (window.bootstrap.Tooltip) {
                document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                    const tooltip = window.bootstrap.Tooltip.getInstance(el);
                    if (tooltip) tooltip.update();
                });
            }
            if (window.bootstrap.Popover) {
                document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
                    const popover = window.bootstrap.Popover.getInstance(el);
                    if (popover) popover.update();
                });
            }
        }
        
        // Accordion/collapse
        document.querySelectorAll('.accordion, .collapse').forEach(item => {
            if (isDark) {
                item.classList.add('accordion-dark');
            } else {
                item.classList.remove('accordion-dark');
            }
        });
    }
    
    // Aggiorna tabelle e dati
    function updateTableElements(isDark) {
        // Tabelle
        document.querySelectorAll('table, .table').forEach(table => {
            if (isDark) {
                table.classList.add('table-dark');
                // Modifica i colori di bordo
                table.querySelectorAll('th, td').forEach(cell => {
                    cell.style.borderColor = '#444';
                });
            } else {
                table.classList.remove('table-dark');
                // Ripristina i colori di bordo
                table.querySelectorAll('th, td').forEach(cell => {
                    cell.style.borderColor = '';
                });
            }
        });
        
        // DataTables (se presente)
        if ($.fn.dataTable) {
            $('.dataTable').each(function() {
                const dataTable = $(this).DataTable();
                if (dataTable) {
                    dataTable.draw();
                }
            });
        }
    }
    
    // Aggiorna grafici e visualizzazioni
    function updateChartElements(isDark) {
        // Chart.js charts
        if (window.charts) {
            Object.values(window.charts).forEach(chart => {
                const options = chart.options;
                if (options.scales) {
                    if (isDark) {
                        options.scales.x.grid.color = 'rgba(255, 255, 255, 0.1)';
                        options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
                        options.scales.x.ticks.color = '#e0e0e0';
                        options.scales.y.ticks.color = '#e0e0e0';
                    } else {
                        options.scales.x.grid.color = 'rgba(0, 0, 0, 0.1)';
                        options.scales.y.grid.color = 'rgba(0, 0, 0, 0.1)';
                        options.scales.x.ticks.color = '#212529';
                        options.scales.y.ticks.color = '#212529';
                    }
                }
                
                // Aggiorna colori per grafici a torta/ciambella
                if (chart.config.type === 'pie' || chart.config.type === 'doughnut') {
                    if (isDark) {
                        options.plugins.legend.labels.color = '#e0e0e0';
                    } else {
                        options.plugins.legend.labels.color = '#212529';
                    }
                }
                
                chart.update();
            });
        }
    }
    
    // Aggiorna immagini in base al tema
    function updateImages(isDark) {
        // Immagini con versioni per tema scuro
        document.querySelectorAll('img[data-dark-src]').forEach(img => {
            if (isDark) {
                const darkSrc = img.getAttribute('data-dark-src');
                if (darkSrc) {
                    if (!img.hasAttribute('data-light-src')) {
                        img.setAttribute('data-light-src', img.src);
                    }
                    img.src = darkSrc;
                }
            } else {
                const lightSrc = img.getAttribute('data-light-src');
                if (lightSrc) {
                    img.src = lightSrc;
                }
            }
        });
        
        // Immagini che necessitano di inversione nel tema scuro
        document.querySelectorAll('img.invert-on-dark').forEach(img => {
            if (isDark) {
                img.style.filter = 'invert(1)';
            } else {
                img.style.filter = '';
            }
        });
    }
    
    // Aggiorna gli elementi di stile
    function updateStylingElements(isDark) {
        // Elementi pre e code per la sintassi
        document.querySelectorAll('pre, code').forEach(block => {
            if (isDark) {
                block.classList.add('dark-code');
            } else {
                block.classList.remove('dark-code');
            }
        });
        
        // Backgrounds con classi comuni
        document.querySelectorAll('.bg-light, .bg-white, .bg-dark').forEach(el => {
            // Non modificare elementi con background scuro esplicito
            if (!el.classList.contains('bg-dark')) {
                if (isDark) {
                    el.dataset.originalBg = [...el.classList]
                        .filter(cls => cls.startsWith('bg-'))
                        .join(' ');
                    el.classList.remove('bg-light', 'bg-white');
                    el.classList.add('bg-dark-theme');
                } else if (el.dataset.originalBg) {
                    el.classList.remove('bg-dark-theme');
                    el.dataset.originalBg.split(' ').forEach(cls => {
                        el.classList.add(cls);
                    });
                    delete el.dataset.originalBg;
                }
            }
        });
        
        // Bordi
        document.querySelectorAll('.border, [class*="border-"]').forEach(el => {
            if (isDark) {
                el.classList.add('border-dark-theme');
            } else {
                el.classList.remove('border-dark-theme');
            }
        });
        
        // Ombre
        document.querySelectorAll('.shadow, .shadow-sm, .shadow-lg').forEach(el => {
            if (isDark) {
                el.classList.add('shadow-dark-theme');
            } else {
                el.classList.remove('shadow-dark-theme');
            }
        });
    }
    
    // Aggiorna componenti specifici del progetto
    function updateProjectSpecificElements(isDark) {
        // Timeline marker (in service-detail.ejs)
        document.querySelectorAll('.timeline-marker').forEach(marker => {
            if (isDark) {
                marker.style.backgroundColor = '#3b82f6'; // Blu più luminoso
            } else {
                marker.style.backgroundColor = ''; // Ripristina al valore default da CSS
            }
        });
        
        // Color swatches nelle impostazioni (in settings.ejs)
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (isDark) {
                swatch.style.border = '2px solid rgba(255, 255, 255, 0.2)';
            } else {
                swatch.style.border = '2px solid rgba(0, 0, 0, 0.1)';
            }
        });
        
        // Service cards (in index.ejs e services.ejs)
        document.querySelectorAll('.service-card, [data-aos]').forEach(card => {
            if (isDark) {
                card.classList.add('service-card-dark');
            } else {
                card.classList.remove('service-card-dark');
            }
        });
        
        // FAQ items (in faq.ejs)
        document.querySelectorAll('.faq-section .card').forEach(card => {
            if (isDark) {
                card.classList.add('faq-card-dark');
            } else {
                card.classList.remove('faq-card-dark');
            }
        });
        
        // Dashboard cards (in dashboard.ejs)
        document.querySelectorAll('.status-badge').forEach(badge => {
            if (isDark) {
                badge.style.opacity = '0.9'; // Riduce leggermente l'opacità per tema scuro
            } else {
                badge.style.opacity = ''; // Ripristina
            }
        });
    }
    
    // Sostituisci le funzioni esistenti con questa nuova implementazione completa
    function updateElementsForDarkTheme() {
        applyThemeToAllElements('dark');
    }
    
    function updateElementsForLightTheme() {
        applyThemeToAllElements('light');
    }
    
    function updateComponentsForTheme(theme) {
        applyThemeToAllElements(theme);
    }
    
    function getColorValue(colorName) {
        const colors = {
            'blue': '#143D80',
            'green': '#147a43',
            'purple': '#6B46C1',
            'orange': '#DD6B20',
            'red': '#C53030',
            'default': '#143D80'
        };
        return colors[colorName] || colors['default'];
    }

    // Funzione per caricare le impostazioni utente dal server
    function loadUserSettings() {
        // Se l'utente non è autenticato, usa solo le impostazioni predefinite
        // e cancella eventuali impostazioni salvate precedentemente
        if (!isAuthenticated) {
            console.log('Utente non autenticato, uso impostazioni predefinite');
            // Cancella eventuali impostazioni salvate in localStorage
            localStorage.removeItem('userSettings');
            localStorage.removeItem('userSettingsTimestamp');
            
            // Applica le impostazioni predefinite e procedi con la creazione dell'interfaccia
            applyUserSettings(userSettings);
            buildInterface();
            return;
        }
        
        // Il resto del codice per gli utenti autenticati rimane invariato
        // Prima verifica se abbiamo impostazioni recenti in localStorage
        const cachedSettings = localStorage.getItem('userSettings');
        const cachedTimestamp = localStorage.getItem('userSettingsTimestamp');
        const now = new Date().getTime();
        
        // Se abbiamo impostazioni in cache e sono recenti (meno di 5 minuti), usale
        if (cachedSettings && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 5 * 60 * 1000) {
            try {
                userSettings = { ...userSettings, ...JSON.parse(cachedSettings) };
                applyUserSettings(userSettings);
                console.log('Impostazioni caricate dalla cache locale');
                
                // Continua con la creazione dell'interfaccia
                buildInterface();
                
                // Carica comunque dal server in background per aggiornare la cache
                fetchSettingsFromServer(false);
                return;
            } catch (e) {
                console.error('Errore nella lettura della cache:', e);
                // Se c'è un errore nella cache, continua con il caricamento dal server
            }
        }
        
        // Altrimenti carica dal server
        fetchSettingsFromServer(true);
    }

    // Funzione separata per il fetching delle impostazioni dal server
    function fetchSettingsFromServer(waitForResponse = true) {
        if (isAuthenticated) {
            fetch('/api/user/settings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nel recupero delle impostazioni');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.settings) {
                    // Aggiorna le impostazioni
                    userSettings = { ...userSettings, ...data.settings };
                    
                    // Salva in localStorage per le future visite
                    localStorage.setItem('userSettings', JSON.stringify(data.settings));
                    localStorage.setItem('userSettingsTimestamp', new Date().getTime().toString());
                    
                    // Applica le impostazioni
                    applyUserSettings(userSettings);
                    console.log('Impostazioni caricate dal server');
                }
            })
            .catch(error => {
                console.error('Errore nel caricamento delle impostazioni dal server:', error);
                
                // Prova a recuperare dalla cache anche se è vecchia
                const cachedSettings = localStorage.getItem('userSettings');
                if (cachedSettings) {
                    try {
                        userSettings = { ...userSettings, ...JSON.parse(cachedSettings) };
                        applyUserSettings(userSettings);
                        console.log('Usate impostazioni in cache perché il server non risponde');
                    } catch (e) {
                        console.error('Errore nel recupero della cache di backup:', e);
                    }
                }
            })
            .finally(() => {
                // Se stiamo aspettando la risposta prima di costruire l'interfaccia
                if (waitForResponse) {
                    buildInterface();
                }
            });
        } else {
            // Se non autenticato, continua con la creazione dell'interfaccia
            if (waitForResponse) {
                buildInterface();
            }
        }
    }

    // Funzione per costruire l'interfaccia
    function buildInterface() {
        // Crea la barra di navigazione
        let navbarLinks;
        
        if (isAuthenticated) {
            // Links per utenti autenticati
            navbarLinks = `
                <li class="nav-item"><a class="nav-link" href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="/about"><i class="fas fa-info-circle"></i> Chi Siamo</a></li>
                <li class="nav-item"><a class="nav-link" href="/services"><i class="fas fa-cogs"></i> Servizi</a></li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <div class="user-avatar-mini d-none d-sm-inline-block">
                            <i class="fas fa-user"></i>
                        </div>
                        <span class="ml-1">Account</span>
                    </a>
                    <div class="dropdown-menu account-dropdown dropdown-menu-right" aria-labelledby="userDropdown">
                        <div class="dropdown-header">
                            <div class="d-flex align-items-center">
                                <div class="user-avatar">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="user-info ml-2">
                                    <h6 class="dropdown-username mb-0">Account</h6>
                                    <small class="text-muted">Benvenuto</small>
                                </div>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="/profile">
                            <i class="fas fa-id-card dropdown-icon"></i>
                            <span>Profilo</span>
                            <i class="fas fa-chevron-right dropdown-indicator"></i>
                        </a>
                        <a class="dropdown-item" href="/settings">
                            <i class="fas fa-cog dropdown-icon"></i>
                            <span>Impostazioni</span>
                            <i class="fas fa-chevron-right dropdown-indicator"></i>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item logout-item" href="/auth/logout">
                            <i class="fas fa-sign-out-alt dropdown-icon"></i>
                            <span>Logout</span>
                        </a>
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
                <li class="nav-item"><a class="nav-link btn btn-glow btn-outline-light btn-sm ml-2" href="/auth/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                <li class="nav-item"><a class="nav-link btn btn-glow btn-primary btn-sm ml-2" href="/auth/register"><i class="fas fa-user-plus"></i> Registrati</a></li>
            `;
        }
        
        // Determina la classe del tema in base alle impostazioni
        const themeClass = userSettings.theme === 'dark' ? 'navbar-dark dark-theme' : 'navbar-dark';
        
        // Determina il colore principale in base alle impostazioni
        const primaryColor = userSettings.primaryColor !== 'default' ? 
            `style="--primary-color: ${getColorValue(userSettings.primaryColor)}"` : '';
        
        // Determina la visualizzazione iniziale dell'indicatore daltonismo
        const colorBlindMode = userSettings.colorBlindMode;
        const indicatorVisibility = (colorBlindMode && colorBlindMode !== 'none') ? '' : 'd-none';
        const indicatorTitle = colorBlindMode ? `Modalità daltonismo: ${colorBlindMode}` : 'Modalità daltonismo';
        const indicatorDataMode = colorBlindMode || 'none';

        const navbar = `
            <header>
                <nav class="navbar navbar-expand-lg ${themeClass} smart-navbar fixed-top" ${primaryColor}>
                    <div class="container">
                        <a class="navbar-brand d-flex align-items-center" href="/">
                            <i class="fas fa-laptop-code mr-2 text-accent logo-icon"></i>
                            <span class="font-weight-bold">Help<span class="text-accent brand-highlight">Digit</span></span>
                        </a>
                        
                        <!-- Indicatore modalità daltonismo (ora esplicitamente prima del toggler) -->
                        <div id="colorblind-indicator" class="colorblind-indicator ${indicatorVisibility}" 
                             title="${indicatorTitle}" data-mode="${indicatorDataMode}">
                            <i class="fas fa-eye"></i>
                        </div>
                        
                        <!-- Assicurati che il pulsante hamburger abbia sempre una buona visibilità -->
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
            <div style="padding-top: 76px;"></div>
        `;

// Sostituisci il footer esistente con questo nuovo footer moderno
const footer = `
    <footer class="modern-footer">
        <div class="footer-top">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                        <div class="footer-brand">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-laptop-code footer-logo-icon mr-3"></i>
                                <h2 class="h4 mb-0">HelpDigit</h2>
                            </div>
                            <p class="footer-text mb-4">Soluzioni digitali su misura per privati e aziende. Trasformiamo la tua visione in realtà con servizi tecnologici professionali.</p>
                            <div class="social-links">
                                <a href="#" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>
                                <a href="#" target="_blank" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                                <a href="https://www.instagram.com/helpdigit/" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-2 col-md-6 col-6 mb-4 mb-lg-0">
                        <h3 class="footer-heading">Servizi</h3>
                        <ul class="footer-links">
                            <li><a href="/services/volantini">Creazione Volantini</a></li>
                            <li><a href="/services/digitalizzazione">Digitalizzazione</a></li>
                            <li><a href="/services/supporto">Supporto Tecnico</a></li>
                            <li><a href="/services/consulenza">Consulenza IT</a></li>
                        </ul>
                    </div>
                    
                    <div class="col-lg-2 col-md-6 col-6 mb-4 mb-lg-0">
                        <h3 class="footer-heading">Azienda</h3>
                        <ul class="footer-links">
                            <li><a href="/about">Chi Siamo</a></li>
                            <li><a href="/faq">FAQ</a></li>
                            <li><a href="/privacy">Privacy</a></li>
                            <li><a href="/terms">Termini</a></li>
                        </ul>
                    </div>
                    
                    <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                        <h3 class="footer-heading">Contatti</h3>
                        <ul class="footer-contact">
                            <li>
                                <i class="fas fa-map-marker-alt contact-icon"></i>
                                <div>
                                    <span>Piazza Carlo Poerio, 2</span>
                                    <span>70126 Bari BA</span>
                                </div>
                            </li>
                            <li>
                                <i class="fas fa-envelope contact-icon"></i>
                                <a href="mailto:helpdigit2025@gmail.com">helpdigit2025@gmail.com</a>
                            </li>
                            <li>
                                <i class="fas fa-clock contact-icon"></i>
                                <span>Lun-Ven: 9:00 - 18:00</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-md-6 text-center text-md-start">
                        <p class="mb-0">&copy; ${new Date().getFullYear()} BetaCloud HelpDigit. Tutti i diritti riservati.</p>
                    </div>
                    <div class="col-md-6">
                        <div class="footer-legal text-center text-md-end">
                            <a href="/privacy">Privacy</a>
                            <a href="/terms">Termini</a>
                            <a href="/cookies">Cookie</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
`;

        // CSS personalizzato
        const customStyles = `
            <style>
                :root {
                    --primary-color: #143D80;
                    --secondary-color: #0A2558;
                    --accent-color: #2B6CB0;
                    --highlight-color: #3182CE;
                    --dark-bg: #1A202C;
                    --light-text: #E6E9ED;
                    --muted-text: #A0AEC0;
                    --navbar-transparent: rgba(26, 32, 44, 0.85);
                    --navbar-solid: #0F2B5B;
                    --navbar-glow: rgba(49, 130, 206, 0.25);
                }
                
                body {
                    font-family: 'Poppins', sans-serif;
                    padding-top: 0;
                    overflow-x: hidden;
                    color: #2D3748;
                    background-color: #FAFAFA;
                }
                
                /* Navbar intelligente */
                .smart-navbar {
                    background-color: var(--navbar-transparent);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.4s ease;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .smart-navbar.scrolled {
                    background-color: var(--navbar-solid);
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15), 0 0 4px var(--navbar-glow);
                }
                
                .smart-navbar.navbar-hidden {
                    transform: translateY(-100%);
                }
                
                /* Elementi della navbar */
                .text-accent {
                    color: var(--accent-color) !important;
                }
                
                .navbar-brand {
                    font-size: 1.6rem;
                    font-weight: 600;
                    position: relative;
                }
                
                .navbar .nav-link {
                    font-weight: 500;
                    color: var(--light-text) !important;
                    padding: 0.5rem 1rem;
                    margin: 0 0.2rem;
                    border-radius: 4px;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .navbar .nav-link:hover {
                    color: white !important;
                    background-color: rgba(255, 255, 255, 0.08);
                }
                
                .navbar .nav-link.active {
                    background-color: rgba(255, 255, 255, 0.12);
                }
                
                .navbar .nav-link.btn {
                    padding: 0.5rem 1rem;
                    margin-left: 0.5rem;
                    border: 1px solid var(--accent-color);
                }
                
                .navbar .nav-link.btn-primary {
                    background-color: var(--accent-color);
                    border-color: var(--accent-color);
                }
                
                .navbar .nav-link.btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(49, 130, 206, 0.3);
                }
                
                /* Effetto fluorescente sottile per la navbar durante lo scorrimento */
                .smart-navbar.scrolled::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        var(--highlight-color) 50%, 
                        transparent 100%);
                    opacity: 0.8;
                }
                
                /* Logo animazione più sottile */
                .logo-icon {
                    animation: float 4s ease-in-out infinite;
                    display: inline-block;
                }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                    100% { transform: translateY(0px); }
                }
                
                /* Dropdown menu professionale */
                .dropdown-menu {
                    background-color: #FFF;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    border: none;
                    border-radius: 6px;
                    margin-top: 10px;
                }
                
                .dropdown-item {
                    color: #4A5568;
                    transition: all 0.2s;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin: 2px 5px;
                }
                
                .dropdown-item:hover {
                    background-color: #EDF2F7;
                    color: var(--primary-color);
                    transform: translateX(3px);
                }
                
                .dropdown-item i {
                    color: var(--accent-color);
                    width: 20px;
                }
                
                /* Pulsanti */
                .btn-primary {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                }
                
                .btn-primary:hover {
                    background-color: var(--secondary-color);
                    border-color: var(--secondary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(15, 43, 91, 0.25);
                }
                
                /* Effetto glow professionale per pulsanti */
                .btn-glow {
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                }
                
                .btn-glow:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg, 
                        rgba(255, 255, 255, 0) 0%, 
                        rgba(255, 255, 255, 0.2) 50%, 
                        rgba(255, 255, 255, 0) 100%
                    );
                    z-index: -1;
                    animation: shine 3s infinite ease-in-out;
                }
                
                @keyframes shine {
                    0% { left: -100%; }
                    20%, 100% { left: 100%; }
                }
                
                /* Stili del footer professionale */
                footer {
                    background-color: #0A1A2F;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                footer h5, footer h6 {
                    color: #E2E8F0;
                    letter-spacing: 0.5px;
                }
                
                footer .text-muted {
                    color: #718096 !important;
                }
                
                footer a.text-muted {
                    transition: color 0.2s;
                    text-decoration: none;
                }
                
                footer a.text-muted:hover {
                    color: #E2E8F0 !important;
                }
                
                /* Preloader più professionale */
                .preloader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(10, 26, 47, 0.98);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    transition: opacity 0.8s ease;
                }

                .spinner {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .spinner i {
                    font-size: 3.5rem;
                    color: var(--accent-color, #3b82f6);
                    margin-bottom: 1rem;
                }

                .spinner p {
                    color: white;
                    font-size: 1.2rem;
                    font-weight: 500;
                    letter-spacing: 1px;
                    margin-top: 0.5rem;
                }

                /* Animazione pulsante per lo spinner */
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .spinner i {
                    animation: pulse 1.5s infinite ease-in-out, fa-spin 2s infinite linear;
                }
                
                /* Animazioni delle card */
                .service-card {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                
                .service-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
                }
                
                /* Responsive adjustments */
                @media (max-width: 992px) {
                    .navbar-collapse {
                        background-color: var(--navbar-solid);
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 10px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    }
                    
                    .navbar .nav-link {
                        padding: 10px 15px;
                        margin: 5px 0;
                    }
                }

                /* Footer moderno */
                .modern-footer {
                    background-color: #111827;
                    color: #e5e7eb;
                    position: relative;
                    z-index: 10;
                }
                
                .footer-top {
                    padding: 5rem 0 3rem;
                }
                
                .footer-bottom {
                    padding: 1.5rem 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 0.875rem;
                    color: #9ca3af;
                }
                
                .footer-brand h2 {
                    color: #fff;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                }
                
                .footer-text {
                    color: #9ca3af;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                
                .footer-logo-icon {
                    color: #3b82f6;
                    font-size: 1.75rem;
                }
                
                .footer-heading {
                    color: #fff;
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    position: relative;
                }
                
                .footer-heading::after {
                    content: '';
                    position: absolute;
                    bottom: -0.5rem;
                    left: 0;
                    width: 2rem;
                    height: 2px;
                    background-color: #3b82f6;
                }
                
                .social-links {
                    display: flex;
                    gap: 1rem;
                }
                
                .social-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #9ca3af;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                
                .social-link:hover {
                    background-color: #3b82f6;
                    color: #fff;
                    transform: translateY(-3px);
                }
                
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-links li {
                    margin-bottom: 0.75rem;
                }
                
                .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    position: relative;
                    display: inline-block;
                    font-size: 0.95rem;
                }
                
                .footer-links a::before {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 1px;
                    background-color: #3b82f6;
                    transition: width 0.3s ease;
                }
                
                .footer-links a:hover {
                    color: #fff;
                }
                
                .footer-links a:hover::before {
                    width: 100%;
                }
                
                .footer-contact {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-contact li {
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: flex-start;
                }
                
                .contact-icon {
                    color: #3b82f6;
                    font-size: 1rem;
                    margin-right: 1rem;
                    margin-top: 0.25rem;
                }
                
                .footer-contact a {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                
                .footer-contact a:hover {
                    color: #3b82f6;
                }
                
                .footer-contact div {
                    display: flex;
                    flex-direction: column;
                }
                
                .footer-legal {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                }
                
                .footer-legal a {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                
                .footer-legal a:hover {
                    color: #fff;
                }
                
                @media (max-width: 767px) {
                    .footer-top {
                        padding: 3rem 0 2rem;
                    }
                    
                    .footer-legal {
                        justify-content: center;
                        gap: 1rem;
                        margin-top: 1rem;
                    }
                }

                /* Stile per l'indicatore di modalità daltonismo nella navbar */
                .colorblind-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 10px;
                    background-color: rgba(255, 255, 255, 0.1);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: help;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .colorblind-indicator:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .colorblind-indicator i {
                    color: #fff;
                    font-size: 16px;
                }

                /* Stili specifici per ciascun tipo di daltonismo */
                .colorblind-indicator[data-mode="deuteranopia"] i {
                    color: #9747FF;
                }

                .colorblind-indicator[data-mode="protanopia"] i {
                    color: #00a5c2;
                }

                .colorblind-indicator[data-mode="tritanopia"] i {
                    color: #d4aa00;
                }

               /* Per schermi piccoli, posiziona l'indicatore daltonismo in modo corretto */
                @media (max-width: 576px) {
                    /* Posiziona il pulsante hamburger sempre in primo piano e ben visibile */
                    .navbar-toggler {
                        position: relative;
                        z-index: 2000 !important; /* Z-index molto alto per garantire che sia in cima */
                        background-color: rgba(21, 61, 128, 0.2); /* Leggero sfondo per migliorare la visibilità */
                    }
                    
                    /* Posiziona l'indicatore daltonismo in modo che non interferisca */
                    .colorblind-indicator {
                        position: absolute;
                        top: 17px;
                        right: 70px; /* Aumentato lo spazio dal bordo destro */
                        width: 30px;
                        height: 30px;
                        margin-left: 0;
                        z-index: 1010; /* Z-index inferiore al pulsante navbar-toggler */
                    }
                    
                    .colorblind-indicator i {
                        font-size: 14px;
                    }
                    
                    /* Assicurati che il logo non interferisca */
                    .navbar-brand {
                        max-width: 60%;
                        overflow: hidden;
                    }
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
            googleFonts.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
            document.head.appendChild(googleFonts);
        }
        
        // Aggiungi libreria AOS per animazioni allo scroll
        if (!document.querySelector('link[href*="aos"]')) {
            const aosCSS = document.createElement('link');
            aosCSS.rel = 'stylesheet';
            aosCSS.href = 'https://unpkg.com/aos@next/dist/aos.css';
            document.head.appendChild(aosCSS);
            
            const aosJS = document.createElement('script');
            aosJS.src = 'https://unpkg.com/aos@next/dist/aos.js';
            document.body.appendChild(aosJS);
        }
        
        // Gestione migliorata dello scroll per la navbar intelligente
        let lastScrollTop = 0;
        const navbarHeight = 76;
        let scrollTimer = null;
        
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.smart-navbar');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Cancella il timer precedente se esistente
            if (scrollTimer !== null) {
                clearTimeout(scrollTimer);
            }
            
            // Gestione della visibilità durante lo scorrimento
            if (scrollTop > 10) {
                navbar.classList.add('scrolled');
                
                // Nascondi la navbar solo durante lo scroll verso il basso dopo una certa distanza
                if (scrollTop > lastScrollTop + 50 && scrollTop > navbarHeight * 2) {
                    navbar.classList.add('navbar-hidden');
                } else {
                    navbar.classList.remove('navbar-hidden');
                }
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Imposta un timer per rimostrare la navbar dopo un po' di inattività
            scrollTimer = setTimeout(function() {
                navbar.classList.remove('navbar-hidden');
            }, 1000);
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Previene valori negativi su alcuni browser
        });

        // Aggiungi animazioni alle card dei servizi (rispettando reduceAnimations)
        if (!userSettings.reduceAnimations) {
            setTimeout(() => {
                const serviceCards = document.querySelectorAll('.service-card');
                serviceCards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100 * (index + 1));
                });
            }, 100);
            
            // Inizializza AOS quando il documento è caricato
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        easing: 'ease-in-out',
                        once: true,
                        disable: userSettings.reduceAnimations
                    });
                }
            }, 500);
        }
        
        // Nascondi il preloader dopo il caricamento completo
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.querySelector('.preloader');
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 800);
                }
            }, 500);
        });

        // Gestisci i cambi di tema in tempo reale (per esempio quando l'utente clicca su un toggle tema)
        document.addEventListener('themeToggle', function(e) {
            const newTheme = e.detail.theme || (document.body.classList.contains('dark-theme') ? 'light' : 'dark');
            window.changeTheme(newTheme);
        });

        // Supporta anche il rilevamento automatico del tema di sistema
        if (window.matchMedia) {
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Gestisci il cambio di tema di sistema se l'utente ha impostato il tema su "auto"
            prefersDarkScheme.addEventListener('change', e => {
                if (userSettings.theme === 'auto') {
                    window.changeTheme(e.matches ? 'dark' : 'light');
                }
            });
            
            // Applica il tema di sistema se l'utente ha impostato il tema su "auto"
            if (userSettings.theme === 'auto') {
                window.changeTheme(prefersDarkScheme.matches ? 'dark' : 'light');
            }
        }
    }

    // Aggiungi stili dinamici per le impostazioni di accessibilità
    const accessibilityStyles = `
        <style id="accessibility-styles">
            /* Dimensioni del font */
            .font-size-1 { --font-size-multiplier: 1; }
            .font-size-2 { --font-size-multiplier: 1.2; }
            .font-size-3 { --font-size-multiplier: 1.4; }
            
            body.font-size-1 { font-size: 1rem; }
            body.font-size-2 { font-size: 1.2rem; }
            body.font-size-3 { font-size: 1.4rem; }
            
            /* Contrasto elevato */
            body.high-contrast {
                --primary-color: #0056b3;
                --secondary-color: #003366;
                --accent-color: #0078d7;
                --highlight-color: #0099ff;
                --dark-bg: #000000;
                --light-text: #ffffff;
                --muted-text: #dddddd;
                --navbar-transparent: rgba(0, 0, 0, 0.95);
                --navbar-solid: #000000;
                color: #ffffff;
                background-color: #000000;
            }
            
            body.high-contrast a:not(.btn),
            body.high-contrast .text-muted {
                color: #3b9dff !important;
            }
            
            body.high-contrast .card,
            body.high-contrast .modal-content,
            body.high-contrast .list-group-item {
                background-color: #0a0a0a;
                border-color: #333333;
            }
            
            /* Modalità daltonismo */
            body.colorblind-deuteranopia {
                --primary-color: #0056b3;
                --accent-color: #0078d7;
                --highlight-color: #0099ff;
            }
            
            body.colorblind-protanopia {
                --primary-color: #005994;
                --accent-color: #0074cc;
                --highlight-color: #0099e6;
            }
            
            body.colorblind-tritanopia {
                --primary-color: #8800aa;
                --accent-color: #aa00d4;
                --highlight-color: #cc00ff;
            }
            
            /* Riduzione animazioni */
            body.reduce-animations *,
            body.reduce-animations *::before,
            body.reduce-animations *::after {
                animation-duration: 0.001ms !important;
                animation-delay: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
                transition-delay: 0.001ms !important;
            }
            
            /* Tema scuro */
            body.dark-theme {
                --primary-color: #0078d7;
                --secondary-color: #005fb8;
                --accent-color: #2B99FF;
                --highlight-color: #47a3ff;
                --dark-bg: #1a1a1a;
                --light-text: #e6e6e6;
                --muted-text: #b3b3b3;
                --navbar-transparent: rgba(26, 26, 26, 0.95);
                --navbar-solid: #111111;
                color: #e6e6e6;
                background-color: #121212;
            }
            
            body.dark-theme .card,
            body.dark-theme .list-group-item,
            body.dark-theme .modal-content {
                background-color: #1e1e1e;
                border-color: #333333;
            }
            
            body.dark-theme .text-dark {
                color: #e6e6e6 !important;
            }
            
            body.dark-theme .text-muted {
                color: #a6a6a6 !important;
            }
            
            /* Colori personalizzati */
            body.color-blue { --primary-color-override: #143D80; }
            body.color-green { --primary-color-override: #147a43; }
            body.color-purple { --primary-color-override: #6B46C1; }
            body.color-orange { --primary-color-override: #DD6B20; }
            body.color-red { --primary-color-override: #C53030; }
            
            /* Layout */
            body.layout-compact .container {
                max-width: 1000px;
            }
            
            body.layout-comfortable .container {
                max-width: 1200px;
            }
            
            body.layout-spacious .container {
                max-width: 1400px;
            }
            
            body.layout-compact p,
            body.layout-compact li {
                margin-bottom: 0.5rem;
            }
            
            body.layout-spacious p,
            body.layout-spacious li {
                margin-bottom: 1.25rem;
                line-height: 1.8;
            }

            /* Transizione fluida tra temi */
            .theme-transition {
                transition: background-color 0.3s ease, color 0.3s ease,
                            border-color 0.3s ease, box-shadow 0.3s ease;
            }
            
            /* Stili specifici per elementi del tema scuro */
            body.dark-theme .btn-outline-primary {
                color: #3b82f6;
                border-color: #3b82f6;
            }
            
            body.dark-theme .btn-outline-primary:hover {
                background-color: #3b82f6;
                color: #fff;
            }
            
            body.dark-theme .modal-content {
                background-color: #1e1e1e;
                border-color: #333;
            }
            
            body.dark-theme .modal-header,
            body.dark-theme .modal-footer {
                border-color: #333;
            }
            
            body.dark-theme .form-control {
                background-color: #2d2d2d;
                border-color: #444;
                color: #e0e0e0;
            }
            
            body.dark-theme .form-control:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
            }
            
            body.dark-theme .table {
                color: #e0e0e0;
            }
            
            body.dark-theme .table thead th {
                border-bottom-color: #444;
            }
            
            body.dark-theme .table td, 
            body.dark-theme .table th {
                border-top-color: #444;
            }
            
            body.dark-theme .table-hover tbody tr:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            /* Supporto specifico per DataTables */
            body.dark-theme .dataTables_wrapper .dataTables_length,
            body.dark-theme .dataTables_wrapper .dataTables_filter,
            body.dark-theme .dataTables_wrapper .dataTables_info,
            body.dark-theme .dataTables_wrapper .dataTables_processing,
            body.dark-theme .dataTables_wrapper .dataTables_paginate {
                color: #e0e0e0;
            }
            
            /* Stile per il codice nel tema scuro */
            body.dark-theme pre, body.dark-theme code {
                background-color: #2d2d2d;
                color: #e0e0e0;
            }
            
            /* Stile scuro per immagini con sfondo trasparente che potrebbero essere poco visibili */
            body.dark-theme img.invert-on-dark {
                filter: invert(1);
            }
            
            /* Aggiustamenti per la modalità alto contrasto */
            body.high-contrast.dark-theme {
                --primary-color: #00a1ff;
                --secondary-color: #0084d1;
                background-color: #000;
                color: #fff;
            }
            
            body.high-contrast.dark-theme .card,
            body.high-contrast.dark-theme .modal-content,
            body.high-contrast.dark-theme .list-group-item {
                background-color: #000;
                border-color: #fff;
            }

            /* Modalità daltonismo - Versione avanzata */
            body.colorblind-deuteranopia,
            body.colorblind-protanopia,
            body.colorblind-tritanopia {
                /* Applica transizioni per cambi fluidi */
                transition: all 0.3s ease-in-out;
            }

            /* DEUTERANOPIA - Difficoltà con il verde */
            body.colorblind-deuteranopia {
                --primary-color: #0056b3;       /* Blu più intenso */
                --accent-color: #0078d7;        /* Blu medio */
                --highlight-color: #0099ff;     /* Blu chiaro */
                --success-color: #9747FF;       /* Viola al posto del verde */
                --danger-color: #d91919;        /* Rosso più intenso */
                --warning-color: #f6d12e;       /* Giallo intenso */
                --info-color: #00b8e6;          /* Ciano */
            }

            body.colorblind-deuteranopia .btn-success {
                background-color: #9747FF !important;
                border-color: #8a35ea !important;
            }

            body.colorblind-deuteranopia .btn-danger {
                background-color: #d91919 !important;
                border-color: #c01616 !important;
            }

            body.colorblind-deuteranopia .text-success {
                color: #9747FF !important;
            }

            body.colorblind-deuteranopia .text-danger {
                color: #d91919 !important;
            }

            body.colorblind-deuteranopia .badge-success {
                background-color: #9747FF !important;
            }

            /* PROTANOPIA - Difficoltà con il rosso */
            body.colorblind-protanopia {
                --primary-color: #0074aa;       /* Blu scuro */
                --accent-color: #00a0e9;        /* Blu chiaro */
                --highlight-color: #30c7ff;     /* Ciano */
                --success-color: #00a5c2;       /* Turchese al posto del verde */
                --danger-color: #e69100;        /* Arancione al posto del rosso */
                --warning-color: #fdda25;       /* Giallo intenso */
                --info-color: #80d8ff;          /* Ciano chiaro */
            }

            body.colorblind-protanopia .btn-success {
                background-color: #00a5c2 !important;
                border-color: #0090aa !important;
            }

            body.colorblind-protanopia .btn-danger {
                background-color: #e69100 !important;
                border-color: #cc8000 !important;
            }

            body.colorblind-protanopia .text-success {
                color: #00a5c2 !important;
            }

            body.colorblind-protanopia .text-danger {
                color: #e69100 !important;
            }

            body.colorblind-protanopia .badge-danger {
                background-color: #e69100 !important;
            }

            /* TRITANOPIA - Difficoltà con il blu */
            body.colorblind-tritanopia {
                --primary-color: #8800aa;       /* Viola */
                --accent-color: #aa00d4;        /* Viola intenso */
                --highlight-color: #cc00ff;     /* Magenta */
                --success-color: #d4aa00;       /* Oro anziché verde */
                --danger-color: #d4002d;        /* Rosso magenta */
                --warning-color: #d47500;       /* Arancione */
                --info-color: #aa557f;          /* Rosa medio */
            }

            body.colorblind-tritanopia .btn-primary {
                background-color: #8800aa !important;
                border-color: #7a0096 !important;
            }

            body.colorblind-tritanopia .btn-success {
                background-color: #d4aa00 !important;
                border-color: #b89200 !important;
            }

            body.colorblind-tritanopia .btn-info {
                background-color: #aa557f !important;
                border-color: #964670 !important;
            }

            /* Regolazioni comuni per grafici e visualizzazioni di dati */
            body[class*="colorblind-"] .chart-area {
                border: 2px dashed var(--accent-color);
                padding: 5px;
            }

            body[class*="colorblind-"] .chart-label {
                font-weight: bold;
                text-decoration: underline;
            }

            /* Indicatori speciali per elementi importanti */
            body[class*="colorblind-"] .btn,
            body[class*="colorblind-"] .alert,
            body[class*="colorblind-"] .badge {
                position: relative;
                overflow: hidden;
            }

            /* Aggiunge pattern per aiutare a distinguere meglio le aree colorate */
            body.colorblind-deuteranopia .navbar::before,
            body.colorblind-protanopia .navbar::before,
            body.colorblind-tritanopia .navbar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent);
                background-size: 10px 10px;
                pointer-events: none;
                z-index: 1;
                opacity: 0.3;
            }

            /* Aggiunge icone per aiutare a distinguere pulsanti importanti */
            body[class*="colorblind-"] .btn-success::after {
                content: "✓";
                margin-left: 5px;
            }

            body[class*="colorblind-"] .btn-danger::after {
                content: "✗";
                margin-left: 5px;
            }

            /* Miglioramenti per i link nei modelli daltonici */
            body[class*="colorblind-"] a:not(.btn):not(.nav-link) {
                text-decoration: underline;
                font-weight: 500;
            }

            /* Aggiunge bordi per migliorare il contrasto di elementi importanti */
            body[class*="colorblind-"] .card,
            body[class*="colorblind-"] .alert,
            body[class*="colorblind-"] .list-group-item.active {
                border-width: 2px;
            }

            /* Indicatore di focus più evidente per accessibilità */
            body[class*="colorblind-"] *:focus {
                outline: 3px solid var(--accent-color) !important;
                outline-offset: 2px !important;
            }

            /* Impostazioni specifiche per le tabelle */
            body[class*="colorblind-"] .table th {
                border-bottom: 2px solid var(--accent-color);
                font-weight: 700;
            }

            body[class*="colorblind-"] .table-striped tbody tr:nth-of-type(odd) {
                background-color: rgba(0, 0, 0, 0.08);
            }

            body.dark-theme[class*="colorblind-"] .table-striped tbody tr:nth-of-type(odd) {
                background-color: rgba(255, 255, 255, 0.08);
            }

            /* Notifica per il cambio modalità daltonico */
            .color-mode-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                color: white;
                padding: 10px 20px;
                border-radius: 30px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                transition: opacity 0.5s ease;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-content i {
                font-size: 1.2rem;
            }

            /* Correggi posizione e visibilità dell'icona hamburger su mobile */
           /* Garantisci visibilità icona hamburger in qualsiasi modalità */
            @media (max-width: 576px) {
                .navbar-toggler {
                    position: absolute !important;
                    right: 15px !important;
                    top: 15px !important;
                    z-index: 5000 !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: flex !important; /* Cambiato da block a flex */
                    align-items: center !important; /* Centratura verticale */
                    justify-content: center !important; /* Centratura orizzontale */
                    background-color: transparent !important;
                    width: 40px !important;
                    height: 38px !important;
                    outline: none !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    padding: 0 !important; /* Rimuove padding che potrebbe influenzare la centratura */
                }
                
                /* Forza la visibilità dell'icona con stile di default più visibile */
                .navbar-toggler .navbar-toggler-icon {
                    opacity: 1 !important;
                    visibility: visible !important;
                    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.95)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E") !important;
                    display: block !important;
                    width: 24px !important; /* Dimensione esplicita */
                    height: 24px !important; /* Dimensione esplicita */
                    margin: 0 !important; /* Rimuove margini che potrebbero influenzare la centratura */
                }
                
                /* Assicura che anche in modalità daltonismo l'icona sia visibile */
                body[class*="colorblind-"] .navbar-toggler .navbar-toggler-icon {
                    filter: brightness(1.3) !important;
                }
                
                /* Posiziona l'indicatore daltonismo in modo che non interferisca */
                .colorblind-indicator {
                    position: absolute;
                    top: 17px;
                    right: 80px !important;
                    width: 30px;
                    height: 30px;
                    margin-left: 0;
                    z-index: 1010;
                }
            }
        </style>
    `;
    
    // Aggiungi gli stili di accessibilità alla head
    document.head.insertAdjacentHTML('beforeend', accessibilityStyles);
    
    // Avvia il processo di caricamento delle impostazioni e creazione dell'interfaccia
    loadUserSettings();
});



// Aggiungi questa funzione al tuo file build.js
window.changeTheme = function(theme) {
    userSettings.theme = theme;
    applyUserSettings(userSettings);
    
    // Salva le impostazioni sul server solo se l'utente è autenticato
    if (isAuthenticated) {
        // Salva in localStorage
        const cachedSettings = localStorage.getItem('userSettings');
        let settings = cachedSettings ? JSON.parse(cachedSettings) : {};
        settings.theme = theme;
        localStorage.setItem('userSettings', JSON.stringify(settings));
        localStorage.setItem('userSettingsTimestamp', new Date().getTime().toString());
        
        // Invia al server
        fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ theme: theme })
        }).catch(error => {
            console.error('Errore nel salvataggio del tema:', error);
        });
    }
    // Per utenti non autenticati, non salvare nulla
};

// Funzione per impostare la modalità daltonico
window.setColorblindMode = function(mode) {
    // Rimuovi tutte le classi daltonismo esistenti
    document.body.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
    
    // Gestione dell'indicatore nel navbar
    const navbarIndicator = document.getElementById('colorblind-indicator');
    
    // Aggiungi la classe corretta se richiesta
    if (mode && mode !== 'none') {
        document.body.classList.add('colorblind-' + mode);
        console.log('Modalità daltonico attivata:', mode);
        
        // Mostra l'indicatore nella navbar
        if (navbarIndicator) {
            navbarIndicator.classList.remove('d-none');
            navbarIndicator.setAttribute('title', 'Modalità daltonismo: ' + mode);
            navbarIndicator.setAttribute('data-mode', mode);
        }
        
        // Mostra una notifica all'utente
        const notification = document.createElement('div');
        notification.className = 'color-mode-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-eye"></i>
                <span>Modalità daltonismo <strong>${mode}</strong> attivata</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Nascondi la notifica dopo alcuni secondi
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    } else {
        // Nascondi l'indicatore nella navbar
        if (navbarIndicator) {
            navbarIndicator.classList.add('d-none');
        }
    }
    
    // Aggiorna le impostazioni utente
    if (window.userSettings) {
        window.userSettings.colorBlindMode = mode;
        
        // Salva solo se autenticato
        if (isAuthenticated) {
            const cachedSettings = localStorage.getItem('userSettings');
            let settings = cachedSettings ? JSON.parse(cachedSettings) : {};
            settings.colorBlindMode = mode;
            localStorage.setItem('userSettings', JSON.stringify(settings));
            localStorage.setItem('userSettingsTimestamp', new Date().getTime().toString());
            
            fetch('/api/user/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ colorBlindMode: mode })
            }).catch(error => {
                console.error('Errore nel salvataggio della modalità daltonico:', error);
            });
        }
    }
};

