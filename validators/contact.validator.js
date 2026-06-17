import Joi from "joi";

const egyptianPhoneRegex = /^(01[0-2,5]\d{8}|015\d{8})$/;

export const createContactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "الاسم مطلوب",
    "string.empty": "الاسم لا يمكن أن يكون فارغاً",
    "string.min": "الاسم يجب أن يكون على الأقل {#limit} حرفين",
    "string.max": "الاسم يجب أن لا يتجاوز {#limit} حرف",
  }),
  email: Joi.string().trim().email({ tlds: false }).required().messages({
    "any.required": "البريد الإلكتروني مطلوب",
    "string.empty": "البريد الإلكتروني لا يمكن أن يكون فارغاً",
    "string.email": "البريد الإلكتروني غير صحيح",
  }),
  phone: Joi.string()
    .trim()
    .allow("")
    .optional()
    .pattern(egyptianPhoneRegex)
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون رقم مصري صحيح (01xxxxxxxxx)",
    }),
  type: Joi.string()
    .valid("complaint", "suggestion", "inquiry", "problem", "opinion")
    .default("inquiry")
    .messages({ "any.only": "نوع الرسالة غير صحيح" }),
  subject: Joi.string().trim().min(3).max(200).required().messages({
    "any.required": "الموضوع مطلوب",
    "string.empty": "الموضوع لا يمكن أن يكون فارغاً",
    "string.min": "الموضوع يجب أن يكون على الأقل {#limit} أحرف",
    "string.max": "الموضوع يجب أن لا يتجاوز {#limit} حرف",
  }),
  message: Joi.string().trim().min(10).max(5000).required().messages({
    "any.required": "الرسالة مطلوبة",
    "string.empty": "الرسالة لا يمكن أن تكون فارغة",
    "string.min": "الرسالة يجب أن تكون على الأقل {#limit} أحرف",
    "string.max": "الرسالة يجب أن لا تتجاوز {#limit} حرف",
  }),
});
