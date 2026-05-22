import express from 'express';
import authController from '../controllers/auth.controller.js'
import  validate  from '../middlewares/validator.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validation.js';
import verifyToken from '../middlewares/verify.middleware.js';
const router = express.Router();

router.post("/register", validate(registerSchema) , authController.register);
router.post("/login", validate(loginSchema) , authController.login);
router.post("/logout",authController.logout)
router.post("/refresh",authController.refreshToken)
router.get("/me", verifyToken , authController.getMe);


export default router ;