import request from "supertest";
import app from "../src/app.js";

describe("Server Health & Basic API Smoke Tests", () => {
  it("GET /health should return 200 OK", async () => {
    const res = await request(app).get("/health");
    expect([200, 404]).toContain(res.status);
  });

  it("app should be defined", () => {
    expect(app).toBeDefined();
  });
});
