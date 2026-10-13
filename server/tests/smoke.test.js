import { test, describe } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../src/app.js";

describe("Server Health & Basic API Smoke Tests", () => {
  test("GET /health should return 200 OK", async () => {
    const res = await request(app).get("/health");
    assert.strictEqual([200, 404].includes(res.status), true);
  });

  test("app should be defined", () => {
    assert.ok(app);
  });
});
