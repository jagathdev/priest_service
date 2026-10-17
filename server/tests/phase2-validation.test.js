import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import app from "../src/app.js";
import User from "../src/models/user.js";
import Otp from "../src/models/otp.js";
import WhatsAppConsent from "../src/models/whatsAppConsent.js";
import { hashOtp } from "../src/services/otp.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_must_be_at_least_32_chars_long_12345";
process.env.JWT_SECRET = JWT_SECRET;

const userAId = "660000000000000000000001";
const userBId = "660000000000000000000002";
const adminId = "660000000000000000000009";

const tokenUserA = jwt.sign({ id: userAId, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
const tokenUserB = jwt.sign({ id: userBId, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
const tokenAdmin = jwt.sign({ id: adminId, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
const expiredToken = jwt.sign({ id: userAId, role: "user" }, JWT_SECRET, { expiresIn: "-1s" });

test("Phase 2 Validation: JWT Authentication & Expiration", async (t) => {
    await t.test("Unauthenticated request to protected route returns 401", async () => {
        const res = await request(app).get("/api/users/profile");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Not authorized, no token/);
    });

    await t.test("Invalid JWT token returns 401", async () => {
        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", "Bearer invalid.jwt.token.here");
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Not authorized, token failed/);
    });

    await t.test("Expired JWT token returns 401", async () => {
        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${expiredToken}`);
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Not authorized, token failed/);
    });
});

test("Phase 2 Validation: Authorization & Cross-User Resource Access (IDOR)", async (t) => {
    await t.test("User A cannot access User B's profile by ID", async () => {
        const res = await request(app)
            .get(`/api/users/profile/${userBId}`)
            .set("Authorization", `Bearer ${tokenUserA}`);
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Forbidden/);
    });

    await t.test("User A cannot access User B's orders", async () => {
        const res = await request(app)
            .get(`/api/orders/user/${userBId}`)
            .set("Authorization", `Bearer ${tokenUserA}`);
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Forbidden/);
    });

    await t.test("User A cannot access User B's wishlist", async () => {
        const res = await request(app)
            .get(`/api/wishlist/${userBId}`)
            .set("Authorization", `Bearer ${tokenUserA}`);
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Forbidden/);
    });

    await t.test("User A cannot update User B's wishlist via body injection", async () => {
        const res = await request(app)
            .post(`/api/wishlist/updateWishlist`)
            .set("Authorization", `Bearer ${tokenUserA}`)
            .send({ userId: userBId, serviceId: "660000000000000000000010" });
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Forbidden/);
    });

    await t.test("Standard User cannot access Admin endpoints", async () => {
        const res = await request(app)
            .get("/api/admin/orders")
            .set("Authorization", `Bearer ${tokenUserA}`);
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Not authorized as an admin/);
    });
});

test("Phase 2 Validation: OTP Expiration, Concurrency-Safe Attempts & Hash Comparison", async (t) => {
    const origFindOne = Otp.findOne;
    const origFindOneAndUpdate = Otp.findOneAndUpdate;
    const origDeleteOne = Otp.deleteOne;

    try {
        const rawOtp = "123456";
        const hashedOtp = hashOtp(rawOtp);

        await t.test("Expired OTP returns 400 and deletes record", async () => {
            let deleted = false;
            Otp.findOne = async () => ({
                _id: "otp_test_id_1",
                mobileNumber: "9876543210",
                otp: hashedOtp,
                expiresAt: new Date(Date.now() - 10000), // Expired
                attempts: 0,
            });
            Otp.deleteOne = async () => { deleted = true; };

            const res = await request(app)
                .post("/api/otp/verifyOtp")
                .send({ mobileNumber: "9876543210", otp: rawOtp });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /OTP has expired/);
            assert.ok(deleted, "Expired OTP record must be deleted");
        });

        await t.test("Incorrect OTP increments attempts atomically and returns remaining count", async () => {
            let attemptCount = 0;
            Otp.findOne = async () => ({
                _id: "otp_test_id_2",
                mobileNumber: "9876543210",
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 60000),
                attempts: attemptCount,
            });
            Otp.findOneAndUpdate = async (filter, update) => {
                attemptCount += (update.$inc?.attempts || 1);
                return {
                    _id: "otp_test_id_2",
                    mobileNumber: "9876543210",
                    otp: hashedOtp,
                    expiresAt: new Date(Date.now() + 60000),
                    attempts: attemptCount,
                };
            };
            Otp.deleteOne = async () => {};

            const res = await request(app)
                .post("/api/otp/verifyOtp")
                .send({ mobileNumber: "9876543210", otp: "999999" });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /Invalid OTP. 4 attempt\(s\) remaining./);
        });

        await t.test("Exceeding 5 attempts locks out and deletes OTP", async () => {
            let deleted = false;
            Otp.findOne = async () => ({
                _id: "otp_test_id_3",
                mobileNumber: "9876543210",
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 60000),
                attempts: 4,
            });
            Otp.findOneAndUpdate = async () => {
                return {
                    _id: "otp_test_id_3",
                    mobileNumber: "9876543210",
                    otp: hashedOtp,
                    expiresAt: new Date(Date.now() + 60000),
                    attempts: 5,
                };
            };
            Otp.deleteOne = async () => { deleted = true; };

            const res = await request(app)
                .post("/api/otp/verifyOtp")
                .send({ mobileNumber: "9876543210", otp: "999999" });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /Maximum OTP verification attempts exceeded/);
            assert.ok(deleted, "OTP record must be deleted on lockout");
        });
    } finally {
        Otp.findOne = origFindOne;
        Otp.findOneAndUpdate = origFindOneAndUpdate;
        Otp.deleteOne = origDeleteOne;
    }
});

test("Phase 2 Validation: WhatsApp Opt-In Authorization & Verified Ownership", async (t) => {
    const origUserFindById = User.findById;
    const origConsentFindOne = WhatsAppConsent.findOne;
    const origConsentFindOneAndUpdate = WhatsAppConsent.findOneAndUpdate;

    try {
        User.findById = async (id) => ({
            _id: id,
            mobileNumber: "9876543210",
            whatsappNumber: "9876543210",
        });

        await t.test("Unauthenticated WhatsApp opt-in rejected with 401", async () => {
            const res = await request(app)
                .post("/api/whatsapp/opt-in")
                .send({ mobileNumber: "9876543210", consent: true });
            assert.equal(res.status, 401);
        });

        await t.test("User attempting to opt-in someone else's phone number rejected with 403", async () => {
            const res = await request(app)
                .post("/api/whatsapp/opt-in")
                .set("Authorization", `Bearer ${tokenUserA}`)
                .send({ mobileNumber: "9111111111", consent: true });
            assert.equal(res.status, 403);
            assert.match(res.body.message, /Forbidden/);
        });

        await t.test("User opting out their own verified phone number succeeds with 200", async () => {
            let savedConsent = null;
            WhatsAppConsent.findOneAndUpdate = async (filter, update) => {
                savedConsent = { ...filter, ...update.$set };
                return savedConsent;
            };

            const res = await request(app)
                .post("/api/whatsapp/opt-out")
                .set("Authorization", `Bearer ${tokenUserA}`)
                .send({ mobileNumber: "9876543210" });

            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(savedConsent.optedIn, false);
            assert.ok(savedConsent.optedOutAt);
        });
    } finally {
        User.findById = origUserFindById;
        WhatsAppConsent.findOne = origConsentFindOne;
        WhatsAppConsent.findOneAndUpdate = origConsentFindOneAndUpdate;
    }
});

test("Phase 2 Validation: Profile Email Validation & Admin Input Sanitization", async (t) => {
    const origUserFindByIdAndUpdate = User.findByIdAndUpdate;

    try {
        User.findByIdAndUpdate = async (_id, update) => ({
            _id: userAId,
            name: update.name || "Test Devotee",
            email: update.email || "",
            mobileNumber: "9876543210",
        });

        await t.test("Invalid email format rejected with 400", async () => {
            const res = await request(app)
                .put("/api/users/updateProfile")
                .set("Authorization", `Bearer ${tokenUserA}`)
                .send({ email: "invalid-email-format" });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /Invalid email address format/);
        });

        await t.test("Valid email format accepted with 200", async () => {
            const res = await request(app)
                .put("/api/users/updateProfile")
                .set("Authorization", `Bearer ${tokenUserA}`)
                .send({ email: "devotee.valid@example.com", name: "Devotee" });

            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
        });

        await t.test("Admin login rejects non-string or malformed inputs with 400", async () => {
            const res = await request(app)
                .post("/api/admin/login")
                .send({ email: { $gt: "" }, password: "password123" });

            assert.equal(res.status, 400);
            assert.equal(res.body.success, false);
        });
    } finally {
        User.findByIdAndUpdate = origUserFindByIdAndUpdate;
    }
});
