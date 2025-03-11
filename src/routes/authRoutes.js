"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get('/login', authController_1.getLogin);
router.post('/login', authController_1.postLogin);
router.get('/register', authController_1.getRegister);
router.post('/register', authController_1.postRegister);
router.get('/logout', authController_1.getLogout);
exports.default = router;
