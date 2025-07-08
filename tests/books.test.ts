import request from "supertest";
import express from "express";
import booksRouter from "../src/routes/books";
import { getDeterministicPriceOrError } from "../src/utils/price";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const testIsbn = "9780140328721";

const app = express();
app.use(express.json());
app.use("/api/books", booksRouter);

describe("POST /api/books", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if isbn or condition is missing", async () => {
    const res = await request(app).post("/api/books").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ISBN and condition are required");
  });

  it("should return 400 for invalid condition", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ isbn: "9780140328721", condition: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "Condition must be one of: new, as_new, damaged"
    );
  });

  it("should return 400 for invalid ISBN", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ isbn: "123", condition: "new" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid ISBN format");
  });

  it("should return 200 with price and title when available", async () => {
    mockedAxios.get.mockResolvedValue({ data: { title: "Test Book" } });

    const res = await request(app)
      .post("/api/books")
      .send({ isbn: testIsbn, condition: "new" });

    expect(res.status).toBe(200);
  });

  it("should calculate correct prices for different conditions", async () => {
    const basePrice = getDeterministicPriceOrError(testIsbn)!;

    mockedAxios.get.mockResolvedValue({ data: { title: "Test Book" } });

    const res = await request(app)
      .post("/api/books")
      .send({ isbn: testIsbn, condition: "as_new" });

    expect(res.body.price).toBe(basePrice * 0.8);
  });

  it("should return 202 when title is missing", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });

    const res = await request(app)
      .post("/api/books")
      .send({ isbn: testIsbn, condition: "new" });

    expect(res.status).toBe(202);
  });

  it("should handle API timeout gracefully", async () => {
    mockedAxios.get.mockRejectedValue(new Error("timeout"));

    const res = await request(app)
      .post("/api/books")
      .send({ isbn: testIsbn, condition: "new" });

    expect(res.status).toBe(202);
    expect(res.body.needsManualCompletion).toBe(true);
  });
});
