// This file contains the JavaScript code for the interactivity of the professional website.

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const serviceSelect = document.getElementById('serviceSelect');
    const requestForm = document.getElementById('requestForm');
    const paymentForm = document.getElementById('paymentForm');
    const editServiceForm = document.getElementById('editServiceForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle user registration
            const formData = new FormData(registerForm);
            fetch('/api/register', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Registrazione avvenuta con successo!');
                      window.location.href = 'login.html';
                  } else {
                      alert('Errore nella registrazione: ' + data.message);
                  }
              });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle user login
            const formData = new FormData(loginForm);
            fetch('/api/login', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Login avvenuto con successo!');
                      window.location.href = 'services.html';
                  } else {
                      alert('Errore nel login: ' + data.message);
                  }
              });
        });
    }

    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const selectedService = serviceSelect.value;
            // Handle service selection
            console.log('Servizio selezionato:', selectedService);
        });
    }

    if (requestForm) {
        requestForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle service request submission
            const formData = new FormData(requestForm);
            fetch('/api/request', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Richiesta inviata con successo!');
                      window.location.href = 'payment.html';
                  } else {
                      alert('Errore nell\'invio della richiesta: ' + data.message);
                  }
              });
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle payment processing
            const formData = new FormData(paymentForm);
            fetch('/api/payment', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Pagamento avvenuto con successo!');
                      window.location.href = 'postService.html';
                  } else {
                      alert('Errore nel pagamento: ' + data.message);
                  }
              });
        });
    }

    if (editServiceForm) {
        editServiceForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle service editing
            const formData = new FormData(editServiceForm);
            fetch('/api/editService', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Servizio modificato con successo!');
                      window.location.href = 'services.html';
                  } else {
                      alert('Errore nella modifica del servizio: ' + data.message);
                  }
              });
        });
    }
});