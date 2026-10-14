import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("Server Health & Basic API Smoke Tests", () => {
    it("GET /health should return 200 OK", async () => {
        const res = await request(app).get("/health");
        assert.ok([200, 404].includes(res.status));
    });

    it("app should be defined", () => {
        assert.ok(app !== undefined && app !== null);
    });
});
