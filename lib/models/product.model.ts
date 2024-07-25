import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const descriptionSchema = new mongoose.Schema({
  descriptionItem: { type: String, required: true },
});

const categorySchema = new mongoose.Schema({
  categoryItem: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    currency: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    priceHistory: [priceHistorySchema],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: [descriptionSchema], // Array of description objects
    category: [categorySchema], // Array of category objects
    reviewsCount: { type: Number },
    stars: { type: String },
    isOutOfStock: { type: Boolean, default: false },
    boughtThisMonth: { type: String },
    users: [
      {
        email: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.AmznProduct || mongoose.model("AmznProduct", productSchema);

export default Product;