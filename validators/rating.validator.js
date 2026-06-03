import joi from "joi";
import validatorMiddleware from "../middlewares/validator.middleware.js";

const createRatingSchema = joi.object({
  stars: joi.number().required().min(1).max(5).messages({
    "number.base": "التقييم يجب أن يكون رقماً",
    "number.min": "أقل تقييم هو 1",
    "number.max": "أقصي تقييم هو 5",
    "any.required": "التقييم مطلوب",
  }),
  comment: joi.string().optional().trim().max(500).messages({
    "string.max": "التعليق لا يتجاوز 500 حرف",
  }),
});

const updateRatingSchema = joi.object({
  stars: joi.number().min(1).max(5).messages({
    "number.base": "التقييم يجب أن يكون رقماً",
    "number.min": "أقل تقييم هو 1",
    "number.max": "أقصي تقييم هو 5",
  }),
  comment: joi.string().optional().trim().max(500).allow("").messages({
    "string.max": "التعليق لا يتجاوز 500 حرف",
  }),
}).min(1);

export const createRatingValidator = validatorMiddleware(createRatingSchema);
export const updateRatingValidator = validatorMiddleware(updateRatingSchema);
