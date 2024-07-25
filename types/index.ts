export type PriceHistoryItem = {
  price: number;
};

export type DescriptionItem = {
  descriptionItem: string;
};

export type CategoryItem = {
  categoryItem: string;
};

export type User = {
  email: string;
};

export type Product = {
  _id?: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: DescriptionItem[] | [];
  category: CategoryItem[] | [];
  reviewsCount: number;
  stars: string;
  isOutOfStock: Boolean;
  users?: User[];
  boughtThisMonth: string;
};

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
  image: string;
};