import mongoose from "mongoose";

/**
 * WorkerReview — تقييمات العملاء على الفني مباشرة
 * مرتبطة بـ Order مكتمل لمنع التلاعب
 */
const workerReviewSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "يجب تحديد الفني"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "يجب تحديد العميل"],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "يجب ربط التقييم بطلب مكتمل"],
      unique: true, // طلب واحد = تقييم واحد بس
    },
    stars: {
      type: Number,
      required: [true, "التقييم بالنجوم مطلوب"],
      min: [1, "أقل تقييم هو 1"],
      max: [5, "أقصى تقييم هو 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "التعليق لا يتجاوز 500 حرف"],
    },
  },
  { timestamps: true }
);

// بعد كل تقييم جديد أو تعديل، نحدث متوسط تقييم الفني
workerReviewSchema.statics.calcAverageRating = async function (workerId) {
  const result = await this.aggregate([
    { $match: { worker: workerId } },
    {
      $group: {
        _id: "$worker",
        avgRating: { $avg: "$stars" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model("Worker").findByIdAndUpdate(workerId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      ratingsCount: result[0].count,
    });
  } else {
    await mongoose.model("Worker").findByIdAndUpdate(workerId, {
      rating: 0,
      ratingsCount: 0,
    });
  }
};

workerReviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.worker);
});

workerReviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.worker);
});

export default mongoose.model("WorkerReview", workerReviewSchema);
