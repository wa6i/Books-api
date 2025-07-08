import express from "express";
import pricingRouter from "./routes/pricing";
import booksRouter from "./routes/books";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/pricing", pricingRouter);
app.use("/api/books", booksRouter);

export default app;
