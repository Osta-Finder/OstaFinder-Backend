import express from 'express';

import authController from '../controllers/auth.controller.js'
import  validate  from '../middlewares/validator.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validation.js';
import verifyToken from '../middlewares/verify.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", validate(registerSchema) , authController.register);
router.post("/login", validate(loginSchema) , authController.login);
router.post("/logout", protect,authController.logout)
router.post("/refresh",authController.refreshTokenHandler);
router.get("/me", protect , authController.getMe);
router.post("/change-password", protect, authController.changePassword);


export default router ;