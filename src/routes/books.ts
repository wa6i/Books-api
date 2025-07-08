import { Router, RequestHandler } from "express";
import axios from "axios";
import ISBN from "isbn-utils";
import { getDeterministicPriceOrError } from "../utils/price";

const router = Router();

interface BookRequest {
  isbn: string;
  condition: "new" | "as_new" | "damaged";
}

interface BookResponse {
  isbn10: string;
  isbn13: string;
  condition: string;
  price?: number;
  title?: string;
  needsManualCompletion: boolean;
}

const addBook: RequestHandler = async (req, res) => {
  try {
    const { isbn, condition }: BookRequest = req.body;

    if (!isbn || !condition) {
      res.status(400).json({
        error: "ISBN and condition are required",
      });
      return;
    }

    if (!["new", "as_new", "damaged"].includes(condition)) {
      res.status(400).json({
        error: "Condition must be one of: new, as_new, damaged",
      });
      return;
    }

    const isbnObj = ISBN.parse(isbn);
    // Validate ISBN

    if (!isbnObj?.isValid()) {
      res.status(400).json({
        error: "Invalid ISBN format",
      });
      return;
    }

    // Convert to both formats
    const isbn10 = isbnObj.asIsbn10();
    const isbn13 = isbnObj.asIsbn13();

    if (!isbn10 || !isbn13) {
      res.status(400).json({
        error: "Could not convert ISBN to required formats",
      });
      return;
    }

    // Get price
    const basePrice = getDeterministicPriceOrError(isbn);

    // In case it was meant from the Ep not the function
    // const pricingResponse = await axios.get(`/api/pricing?isbn=${isbn}`);
    // const basePrice = pricingResponse.data.price;

    // Calculate price with condition coefficient
    let finalPrice: number | undefined;
    if (basePrice !== null) {
      const coefficients = {
        new: 1.0,
        as_new: 0.8,
        damaged: 0.5,
      };
      finalPrice = basePrice * coefficients[condition];
    }

    // Fetch title from Open Library API
    let title: string | undefined;
    try {
      const response = await axios.get(
        `https://openlibrary.org/isbn/${isbn13}.json`
      );

      if (response.data?.title) {
        title = response.data.title;
      }
    } catch (error) {
      console.log("Failed to fetch title from Open Library API", error);
    }

    // Prepare response
    const response: BookResponse = {
      isbn10,
      isbn13,
      condition,
      needsManualCompletion: !finalPrice || !title,
    };

    if (finalPrice) {
      response.price = finalPrice;
    }

    if (title) {
      response.title = title;
    }

    // Return appropriate status code
    if (finalPrice && title) {
      res.status(200).json(response);
      return;
    } else {
      res.status(202).json(response);
      return;
    }
  } catch (error) {
    console.error("Error processing book request:", error);
    res.status(500).json({
      error: "Internal server error",
    });
    return;
  }
};

router.post("/", addBook);

export default router;
