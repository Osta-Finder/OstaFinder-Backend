import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .trim(),

    email: Joi.string()
        .email()
        .required()
        .lowercase(),

    phoneNumber: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .required(),
    role : Joi.string(),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(
            new RegExp(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"
            )
        )
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number and special character",
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
        }),
});


export const loginSchema = Joi.object({

    emailorPhone: Joi.string()
        .trim()
        .lowercase()
        .messages({
            "string.empty": "Email or phone number is required",
            "any.required": "Email or phone number is required",
        }),

    password: Joi.string()
        .required()
        .min(8)
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "any.required": "Password is required",
        }),

});