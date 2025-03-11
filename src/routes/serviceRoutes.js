"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const serviceController = new serviceController_1.ServiceController();
// Route pubbliche
router.get('/', serviceController.selectService);
router.get('/dashboard/services', authMiddleware_1.authenticate, serviceController.getServicesForDashboard);
router.get('/:id', serviceController.getServiceById);
// Route protette (richiedono autenticazione)
router.get('/request/:id', authMiddleware_1.authenticate, serviceController.requestService);
router.post('/create', authMiddleware_1.authenticate, serviceController.createService);
router.put('/edit/:id', authMiddleware_1.authenticate, serviceController.editService);
router.delete('/delete/:id', authMiddleware_1.authenticate, serviceController.deleteService);
exports.default = router;
