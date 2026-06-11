import express from "express";
import multer from "multer";
import { uploadImage, getImages, deleteImage } from "../controllers/upload.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, getImages);
router.post("/", verifyToken, upload.single("file"), uploadImage);
router.delete("/", verifyToken, deleteImage);

export default router;
