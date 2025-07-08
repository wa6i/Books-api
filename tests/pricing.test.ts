import request from "supertest";
import express from "express";
import pricingRouter from "../src/routes/pricing";

const app = express();
app.use(express.json());
app.use("/api/pricing", pricingRouter);

const isbnWithPrice = "9780140328721";
const isbnWithoutPrice = "9780140328722";

describe("GET /api/pricing", () => {
  it("should return 400 if isbn is missing", async () => {
    const res = await request(app).get("/api/pricing");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ISBN query parameter is required");
  });

  it("should return price for valid ISBN", async () => {
    const res = await request(app).get(`/api/pricing?isbn=${isbnWithPrice}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("price");
    expect(res.body.price).toBeGreaterThanOrEqual(10);
  });

  it("should return 404 for ISBN that has no price", async () => {
    const res = await request(app).get(`/api/pricing?isbn=${isbnWithoutPrice}`);
    expect(res.body.error).toBe("Price not found for this ISBN");
  });

  it("should return same result for same ISBN", async () => {
    const res1 = await request(app).get(`/api/pricing?isbn=${isbnWithPrice}`);
    const res2 = await request(app).get(`/api/pricing?isbn=${isbnWithPrice}`);
    expect(res1.status).toBe(res2.status);
  });
});
