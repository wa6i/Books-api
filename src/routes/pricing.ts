import { Router, RequestHandler } from "express";
import { getDeterministicPriceOrError } from "../utils/price";

const router = Router();

const getPricing: RequestHandler = (req, res) => {
  const { isbn } = req.query;

  if (!isbn || typeof isbn !== "string") {
    res.status(400).json({
      error: "ISBN query parameter is required",
    });
    return;
  }

  const price = getDeterministicPriceOrError(isbn);

  if (price === null) {
    res.status(404).json({
      error: "Price not found for this ISBN",
    });
    return;
  }

  res.status(200).json({
    isbn,
    price,
  });
};

router.get("/", getPricing);

export default router;
