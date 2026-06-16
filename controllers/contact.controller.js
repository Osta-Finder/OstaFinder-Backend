import asyncHandler from "express-async-handler";
import Contact from "../models/contact.model.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export const createContact = asyncHandler(async (req, res, next) => {
  const { name, email, phone, type, subject, message } = req.body;

  const contact = await Contact.create({ name, email, phone, type, subject, message });

  res.status(201).json({
    success: true,
    message: "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً",
    data: contact,
  });
});

export const getContacts = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
    delete req.query.type;
  }

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === "true";
    delete req.query.isRead;
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
      { subject: { $regex: req.query.search, $options: "i" } },
    ];
    delete req.query.search;
  }

  const countDocuments = await Contact.countDocuments(filter);

  const apiFeatures = new ApiFeatures(Contact.find(filter), req.query)
    .sort()
    .paginate(countDocuments);

  const contacts = await apiFeatures.mongooseQuery;

  const counts = {
    total: await Contact.countDocuments(),
    unread: await Contact.countDocuments({ isRead: false }),
    complaints: await Contact.countDocuments({ type: "complaint" }),
  };

  res.status(200).json({
    success: true,
    count: contacts.length,
    pagination: apiFeatures.paginationResult,
    counts,
    data: contacts,
  });
});

export const getContactById = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return next(new ApiError("الرسالة غير موجودة", 404));

  res.status(200).json({ success: true, data: contact });
});

export const deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return next(new ApiError("الرسالة غير موجودة", 404));

  res.status(200).json({ success: true, message: "تم حذف الرسالة بنجاح" });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!contact) return next(new ApiError("الرسالة غير موجودة", 404));

  res.status(200).json({ success: true, message: "تم تحديث حالة الرسالة", data: contact });
});
