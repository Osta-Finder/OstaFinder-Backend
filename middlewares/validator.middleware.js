import ApiError from "../utils/ApiError.js";

const validatorMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new ApiError(errMessage, 400));
    }
    next();
  };
};

export default validatorMiddleware;
