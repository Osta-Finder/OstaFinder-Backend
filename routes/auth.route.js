import express from 'express';

import authController from '../controllers/auth.controller.js'
import validate from '../middlewares/validator.middleware.js';
import { loginSchema, registerSchema, updateMeSchema } from '../validators/auth.validation.js';
import verifyToken from '../middlewares/verify.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", protect, authController.logout)
router.post("/refresh", authController.refreshTokenHandler);
router.get("/me", protect, authController.getMe);
router.put("/me", protect, validate(updateMeSchema), authController.updateMe);


export default router;
