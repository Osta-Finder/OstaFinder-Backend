import joi from "joi";
import validatorMiddleware from "../middlewares/validator.middleware.js";

const createRequestSchema = joi.object({
  service: joi.string().required().trim().messages({
    "string.empty": "الخدمة مطلوبة",
    "any.required": "الخدمة مطلوبة",
  }),
  worker: joi.string().required().hex().length(24).messages({
    "string.empty": "الصنايعي مطلوب",
    "any.required": "الصنايعي مطلوب",
  }),
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
  image: joi.string().optional().allow(null).uri().messages({
    "string.uri": "رابط الصورة غير صحيح",
  }),
});

const updateStatusSchema = joi.object({
  status: joi
    .string()
    .valid("pending", "accepted", "on_the_way", "in_progress", "completed", "rejected")
    .required()
    .messages({
      "any.only": "حالة غير صالحة",
      "any.required": "الحالة مطلوبة",
    }),
  eta: joi.string().allow("").optional(),
});

export const createRequestValidator = validatorMiddleware(createRequestSchema);
export const updateStatusValidator = validatorMiddleware(updateStatusSchema);
