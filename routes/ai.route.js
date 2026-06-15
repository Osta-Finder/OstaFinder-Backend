import express from "express";
import { aiChat, getChatSession } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/chat", protect, aiChat);
router.get("/session", protect, getChatSession);

export default router;
