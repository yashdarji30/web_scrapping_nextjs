import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHTDATA_USERNAME);
  const password = String(process.env.BRIGHTDATA_PASSWORD);
  const port = 22225;
  const session_id = (Math.random() * 1000000) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password: password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".a-price-whole , .a-price-fraction"),
      $("a.size.base.a-color-price"),
      $(".priceToPay span.a-price-whole , .priceToPay span.a-price-fraction")
    );

    const originalPrice = extractPrice(
      $(".a-price.a-text-price span.a-offscreen"),
      $(".a-price.a-text-price span.a-price-whole"),
      $(".a-price.a-text-price span.a-price-fraction")
    );

    const outOfStock = $("#availability span")
      .text()
      .toLowerCase()
      .includes("unavailable");

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrl = Object.keys(JSON.parse(images));

    const currency = extractCurrency($(".a-price-symbol"));
    const discountRateText = $(".savingsPercentage").text().trim().match(/\d+/);
    const discountRate = discountRateText ? discountRateText[0] : "0";

    const description: { descriptionItem: string }[] = [];
    $("#feature-bullets ul li").each((_, el) => {
      description.push({ descriptionItem: $(el).text().trim() });
    });

    const category: { categoryItem: string }[] = [];
    $("#wayfinding-breadcrumbs_feature_div .a-link-normal").each((_, el) => {
      category.push({ categoryItem: $(el).text().trim() });
    });

    const reviewsCountText = $("#acrCustomerReviewText")
      .text()
      .match(/\d{1,3}(?:,\d{3})*/);
    const reviewsCount = reviewsCountText
      ? reviewsCountText[0].replace(/,/g, "")
      : 0;

    const stars = $("#acrPopover").attr("title");

    // <span id="social-proofing-faceout-title-tk_bought" class="a-size-small social-proofing-faceout-title-text">    <span>5K+ bought in past month</span>     </span>
    const boughtThisMonth = String(
      $("#social-proofing-faceout-title-tk_bought").text().trim()
    );

    const data = {
      url,
      currency: currency || "$",
      image: imageUrl[0],
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(originalPrice),
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category, // Array of category objects
      reviewsCount: Number(reviewsCount),
      stars: String(stars).substring(0, 3),
      isOutOfStock: outOfStock,
      description, // Array of description objects
      boughtThisMonth,
    };

    return data;
  } catch (error: any) {
    throw new Error(`failed to scrape product: ${error.message}`);
  }
}