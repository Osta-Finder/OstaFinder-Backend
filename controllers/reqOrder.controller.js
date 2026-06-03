import reqOrderModel from "../models/reqOrder.model.js";
import workerModel from "../models/worker.model.js";
import ApiError from "../utils/ApiError.js";

export const createOrder = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    // const customerId = req.user._id;
    const customerId = "6a105ea041c973536f0d475a";

    const { category, description, phone, preferredTime, location } = req.body;

    const worker = await workerModel.findById(workerId);
    if(!worker){
      return next(new ApiError("عذراً، لم يتم العثور على هذا الفني في النظام", 404));
    }
    if(worker.category.toString() !== category.toString()){
      return next(new ApiError("خطأ! : التخصص المختار لا يطابق التخصص الفعلي لهذا الفني", 400))
    }


    const newOrder = await reqOrderModel.create({
      customer: customerId,
      worker: workerId,
      category,
      description,
      phone,
      preferredTime,
      location,
    });
    res.status(201).json({
      success: true,
      message: "تم إرسال طلب الخدمة بنجاح وفي انتظار رد الفني",
      data: newOrder,
    });
  } catch (err) {
    next(err);
  }
};
