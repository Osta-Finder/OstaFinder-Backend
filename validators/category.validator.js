import joi from "joi";
import validatorMiddleware from "../middlewares/validator.middleware.js";

// validation on creation
const createCategorySchema = joi.object({
  name: joi.string().required().min(3).max(15).messages({
    "string.empty": "اسم التصنيف لا يمكن أن يكون فارغاً",
    "string.min": "اسم التصنيف يجب أن يكون ثلاث احرف على الأقل",
    "string.max": "اسم التصنيف لا يمكن أن يتجاوز 50 حرفاً",
    "any.required": "اسم التصنيف حقل مطلوب",
  }),
  icon: joi
    .string()
    .required()
    .messages({
      "string.empty": "معرف الأيقونة مطلوب ولا يمكن تركه فارغاً",
      "any.required": "الأيقونة حقل مطلوب",
    }),
});

// validation on update
const updateCategorySchema = joi.object({
    name: joi.string().min(2).max(15),
    icon: joi.string(),
}).min(1)

export const createCategoryValidator = validatorMiddleware(createCategorySchema)
export const updateCategoryValidator = validatorMiddleware(updateCategorySchema)
