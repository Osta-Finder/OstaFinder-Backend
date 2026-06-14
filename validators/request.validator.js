import joi from "joi";
import validatorMiddleware from "../middlewares/validator.middleware.js";

const createRequestSchema = joi.object({
  // service: joi.string().required().trim().messages({
  //   "string.empty": "الخدمة مطلوبة",
  //   "any.required": "الخدمة مطلوبة",
  // }),
  // worker: joi.string().required().hex().length(24).messages({
  //   "string.empty": "الصنايعي مطلوب",
  //   "any.required": "الصنايعي مطلوب",
  // }),
  date: joi.date().required().messages({
    "date.base": "التاريخ يجب أن يكون صحيحاً",
    "any.required": "التاريخ مطلوب",
  }),
  address: joi.string().required().trim().messages({
    "string.empty": "العنوان مطلوب",
    "any.required": "العنوان مطلوب",
  }),
  amount: joi.number().required().min(0).messages({
    "number.base": "المبلغ يجب أن يكون رقماً",
    "number.min": "المبلغ يجب أن يكون أكبر من صفر",
    "any.required": "المبلغ مطلوب",
  }),
  phoneNumber: joi.string().required().pattern(/^[0-9]{11}$/).messages({
    "string.empty": "رقم الهاتف مطلوب",
    "string.pattern.base": "رقم الهاتف يجب أن يتكون من 11 رقماً",
    "any.required": "رقم الهاتف مطلوب",
  }),
  description: joi.string().required().trim().max(500).messages({
    "string.empty": "وصف المشكلة مطلوب",
    "string.max": "الوصف يجب ألا يتجاوز 500 حرف",
    "any.required": "وصف المشكلة مطلوب",
  }),
  category: joi.string().hex().length(24).optional().messages({
    "string.hex": "معرف الفئة يجب أن يكون صالحاً",
    "string.length": "معرف الفئة يجب أن يكون 24 حرفاً",
  })
});

const updateStatusSchema = joi.object({
  status: joi
    .string()
    .valid("pending", "accepted", "in_progress", "completed", "rejected")
    .required()
    .messages({
      "any.only": "حالة غير صالحة",
      "any.required": "الحالة مطلوبة",
    }),
});

export const createRequestValidator = validatorMiddleware(createRequestSchema);
export const updateStatusValidator = validatorMiddleware(updateStatusSchema);
