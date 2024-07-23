import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";
import { Average } from "next/font/google";
export async function scrapeAmazonProduct(url : string) {
    if(!url) return;

    //BrightData proxy Configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSEORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }
    try{
        //Fetch product Page
        const response = await axios.get(url,options)
        const $ = cheerio.load(response.data);

        //Extract the product title
        const title = $('#productTitle').text().trim();

        const currentPrice =  extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price')
        ); 
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );
        const outofStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('#imagBlkFront').attr('data-a-dynamic-image') ||
        $('#landingImage').attr('data-a-dynamic-image') || '{}'

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'));

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,"");
        

        const description = extractDescription($);
        //contruct data object with scraped information
      
        const data = {
            url,
            currency:currency || '$',
            image : imageUrls[0],
            title,
            currentPrice : Number(currentPrice) || Number(originalPrice),
            originalPrice : Number(originalPrice) || Number(currentPrice),
            priceHistory : [],
            discountRate : Number(discountRate),
            category : 'category',
            reviewsCount : 100,
            stars: 4.5,
            isOutOfStock: outofStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice : Number(currentPrice) || Number(originalPrice),
            
        }
        console.log({title,currentPrice,originalPrice,outofStock,imageUrls,currency,discountRate});
        return data;
        
        
        }catch(error:any){
           throw new Error(`Failed to create/update product: ${error.message}`); 
        }
}
