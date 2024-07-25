import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { connectToDB } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic'
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    if (!products) throw new Error("No products found");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) throw new Error("No product found");

        const updatedPriceHistory: any = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
        );

        const emailNotificationType = getEmailNotifType(scrapedProduct,currentProduct);

        if (emailNotificationType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            image: updatedProduct.image,
          }
          const emailContent = await generateEmailBody(productInfo, emailNotificationType);

          const userEmails = updatedProduct.users.map((user:any) => user.email);

          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );
    return NextResponse.json(
      {
        message: 'OK',
        data: updatedProducts,
      }
    );
  } catch (error: any) {
    console.log("Error details:", error);
    throw new Error("Failed to get all products");
  }
}