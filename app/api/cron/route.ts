import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose";
import { getEmailNotifType, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(){

    try{
         connectToDB();
         const products = await Product.find({});
         
         if(!products) throw new Error("No products found");

         //1. SCRAPE LATEST PRODUCT DETIALS & UPDATE DB

         const updateProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

                if(!scrapedProduct) throw new Error("No product fonund");

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    {price: scrapedProduct.currentPrice}
                ]
    
                const product = {
                    ...scrapedProduct,
                    priceHistory : updatedPriceHistory,
                    lowestPrice : getLowestPrice(updatedPriceHistory),
                    heightPrice : getLowestPrice(updatedPriceHistory),
                    averagePrice : getLowestPrice(updatedPriceHistory),
    
                }
            
            const updatedProduct = await Product.findOneAndUpdate({
                url: scrapedProduct.url},
                product,
            );
        
            //2. check each product's status And Email accordingly
            const emailNotifType = getEmailNotifType(scrapedProduct,currentProduct)
            if(emailNotifType && updatedProduct.users.length > 0){
                const productInfo = {
                    title: updatedProduct.title,
                    url: updatedProduct.url,
                }
                const emailContent = await generateEmailBody(productInfo,emailNotifType);

                const userEmails = updatedProduct.users.map((user : any)  => user.email);

                await sendEmail(emailContent,userEmails)

            }
            return updatedProduct
           })
        )
           return NextResponse.json({
            message: "ok", data: updateProducts
           })
         
    }catch(error)
    {
        console.log(`Error in GET:${error}`);
    }
}