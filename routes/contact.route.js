import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  deleteContact,
  markAsRead,
} from "../controllers/contact.controller.js";
import { createContactSchema } from "../validators/contact.validator.js";
import validate from "../middlewares/validator.middleware.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", validate(createContactSchema), createContact);

router.use(protect, restrictTo("admin"));

router.get("/", getContacts);
router.get("/:id", getContactById);
router.delete("/:id", deleteContact);
router.patch("/:id/read", markAsRead);

export default router;
