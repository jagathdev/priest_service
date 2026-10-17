# API Endpoints Documentation

Comprehensive documentation for all REST API endpoints configured and mounted in `server.js` and `app.js`.

- **Base URL (Production):** `https://priestservices.astroved.com`
- **Base URL (Local Development):** `http://localhost:8564` (Configurable via `process.env.PORT`)

---

## Table of Contents
1. [Health Check API](#1-health-check-api)
2. [Hero Banners API](#2-hero-banners-api)
3. [Pujas API](#3-pujas-api)
4. [Homas API](#4-homas-api)
5. [Pooja Details API](#5-pooja-details-api)
6. [OTP & Authentication API](#6-otp--authentication-api)
7. [Users API](#7-users-api)
8. [Orders API](#8-orders-api)
9. [Wishlist API](#9-wishlist-api)
10. [Customer Queries API](#10-customer-queries-api)
11. [Payments API (Razorpay)](#11-payments-api-razorpay)
12. [Promo Codes API](#12-promo-codes-api)
13. [WhatsApp Notifications API](#13-whatsapp-notifications-api)
14. [Admin Management API](#14-admin-management-api)

---

## 1. Health Check API
**Base Path:** `/health`

### 1.1 Server Health Status
- **Endpoint:** `/health`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-10-12T09:20:00.000Z"
}
```

---

## 2. Hero Banners API
**Base Path:** `/api/hero-banners`

### 2.1 Get All Active Hero Banners
- **Endpoint:** `/api/hero-banners`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c1",
      "tagLine": "Special Offer",
      "title": "Ganesh Chaturthi Special",
      "description": "Book your puja now and get 10% off.",
      "cta": {
        "text": "Book Now",
        "url": "/puja/ganesh-chaturthi"
      },
      "imageUrl": "https://example.com/banner.jpg",
      "isActive": true,
      "displayOrder": 1,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    }
  ]
}
```

### 2.2 Get Hero Banner by ID
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c1",
    "tagLine": "Special Offer",
    "title": "Ganesh Chaturthi Special",
    "description": "Book your puja now and get 10% off.",
    "cta": {
      "text": "Book Now",
      "url": "/puja/ganesh-chaturthi"
    },
    "imageUrl": "https://example.com/banner.jpg",
    "isActive": true,
    "displayOrder": 1,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

### 2.3 Create Hero Banner (Admin)
- **Endpoint:** `/api/hero-banners`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "tagLine": "Special Offer",
  "title": "Ganesh Chaturthi Special",
  "description": "Book your puja now and get 10% off.",
  "cta": {
    "text": "Book Now",
    "url": "/puja/ganesh-chaturthi"
  },
  "imageUrl": "https://example.com/banner.jpg",
  "isActive": true,
  "displayOrder": 1
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Hero banner created successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c1",
    "tagLine": "Special Offer",
    "title": "Ganesh Chaturthi Special",
    "description": "Book your puja now and get 10% off.",
    "cta": {
      "text": "Book Now",
      "url": "/puja/ganesh-chaturthi"
    },
    "imageUrl": "https://example.com/banner.jpg",
    "isActive": true,
    "displayOrder": 1,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

### 2.4 Update Hero Banner (Admin)
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "title": "Updated Ganesh Chaturthi Special",
  "displayOrder": 2
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hero banner updated successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c1",
    "tagLine": "Special Offer",
    "title": "Updated Ganesh Chaturthi Special",
    "description": "Book your puja now and get 10% off.",
    "cta": {
      "text": "Book Now",
      "url": "/puja/ganesh-chaturthi"
    },
    "imageUrl": "https://example.com/banner.jpg",
    "isActive": true,
    "displayOrder": 2,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-05T12:00:00.000Z"
  }
}
```

### 2.5 Delete Hero Banner (Admin)
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hero banner deleted successfully"
}
```

---

## 3. Pujas API
**Base Path:** `/api/pujas`

### 3.1 Get All Pujas
- **Endpoint:** `/api/pujas`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c2",
      "name": "Ganesh Puja",
      "title": "Ganesh Puja",
      "description": "Removes obstacles and brings prosperity.",
      "about": "Detailed about section for Ganesh Puja...",
      "benefits": ["Removes Obstacles", "Brings Success"],
      "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
      "deity": "Lord Ganesha",
      "price": 1000,
      "basePrice": 1000,
      "extraParticipantPrice": 250,
      "maxParticipants": 5,
      "imageUrl": "https://example.com/ganesh-puja.jpg",
      "image": "https://example.com/ganesh-puja.jpg",
      "status": "active",
      "isActive": true,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    }
  ]
}
```

### 3.2 Get Puja by ID
- **Endpoint:** `/api/pujas/:id`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "name": "Ganesh Puja",
    "title": "Ganesh Puja",
    "description": "Removes obstacles and brings prosperity.",
    "about": "Detailed about section for Ganesh Puja...",
    "benefits": ["Removes Obstacles", "Brings Success"],
    "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
    "deity": "Lord Ganesha",
    "price": 1000,
    "basePrice": 1000,
    "extraParticipantPrice": 250,
    "maxParticipants": 5,
    "imageUrl": "https://example.com/ganesh-puja.jpg",
    "image": "https://example.com/ganesh-puja.jpg",
    "status": "active",
    "isActive": true,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

### 3.3 Create Puja (Admin)
- **Endpoint:** `/api/pujas`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "title": "Ganesh Puja",
  "description": "Removes obstacles and brings prosperity.",
  "about": "Detailed about section for Ganesh Puja...",
  "benefits": ["Removes Obstacles", "Brings Success"],
  "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
  "deity": "Lord Ganesha",
  "price": 1000,
  "basePrice": 1000,
  "extraParticipantPrice": 250,
  "maxParticipants": 5,
  "imageUrl": "https://example.com/ganesh-puja.jpg",
  "status": "active",
  "isActive": true
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Puja created successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "name": "Ganesh Puja",
    "title": "Ganesh Puja",
    "description": "Removes obstacles and brings prosperity.",
    "about": "Detailed about section for Ganesh Puja...",
    "benefits": ["Removes Obstacles", "Brings Success"],
    "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
    "deity": "Lord Ganesha",
    "price": 1000,
    "basePrice": 1000,
    "extraParticipantPrice": 250,
    "maxParticipants": 5,
    "imageUrl": "https://example.com/ganesh-puja.jpg",
    "image": "https://example.com/ganesh-puja.jpg",
    "status": "active",
    "isActive": true,
    "createdAt": "2026-10-01T12:00:00.000Z",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
}
```

### 3.4 Update Puja (Admin)
- **Endpoint:** `/api/pujas/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "price": 1200,
  "basePrice": 1200,
  "extraParticipantPrice": 300
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Puja updated successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "name": "Ganesh Puja",
    "title": "Ganesh Puja",
    "price": 1200,
    "basePrice": 1200,
    "extraParticipantPrice": 300
  }
}
```

### 3.5 Delete Puja (Admin)
- **Endpoint:** `/api/pujas/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Puja deleted successfully"
}
```

---

## 4. Homas API
**Base Path:** `/api/homas`

### 4.1 Get All Homas
- **Endpoint:** `/api/homas`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c3",
      "name": "Lakshmi Homa",
      "title": "Lakshmi Homa",
      "description": "For wealth and prosperity.",
      "about": "Detailed about section for Lakshmi Homa...",
      "benefits": ["Wealth", "Prosperity"],
      "process": ["Ganapati Sthapana", "Sankalpa", "Havan"],
      "deity": "Goddess Lakshmi",
      "price": 2500,
      "basePrice": 2500,
      "extraParticipantPrice": 500,
      "maxParticipants": 5,
      "imageUrl": "https://example.com/lakshmi-homa.jpg",
      "image": "https://example.com/lakshmi-homa.jpg",
      "status": "active",
      "isActive": true,
      "createdAt": "2026-10-01T12:00:00.000Z",
      "updatedAt": "2026-10-01T12:00:00.000Z"
    }
  ]
}
```

### 4.2 Get Homa by ID
- **Endpoint:** `/api/homas/:id`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c3",
    "name": "Lakshmi Homa",
    "title": "Lakshmi Homa",
    "price": 2500,
    "basePrice": 2500
  }
}
```

### 4.3 Create Homa (Admin)
- **Endpoint:** `/api/homas`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "title": "Lakshmi Homa",
  "description": "For wealth and prosperity.",
  "about": "Detailed about section for Lakshmi Homa...",
  "benefits": ["Wealth", "Prosperity"],
  "process": ["Ganapati Sthapana", "Sankalpa", "Havan"],
  "deity": "Goddess Lakshmi",
  "price": 2500,
  "basePrice": 2500,
  "extraParticipantPrice": 500,
  "maxParticipants": 5,
  "imageUrl": "https://example.com/lakshmi-homa.jpg",
  "status": "active"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Homa created successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c3",
    "name": "Lakshmi Homa",
    "title": "Lakshmi Homa",
    "price": 2500,
    "basePrice": 2500,
    "status": "active"
  }
}
```

### 4.4 Update Homa (Admin)
- **Endpoint:** `/api/homas/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "price": 2700,
  "basePrice": 2700
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Homa updated successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c3",
    "price": 2700,
    "basePrice": 2700
  }
}
```

### 4.5 Delete Homa (Admin)
- **Endpoint:** `/api/homas/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Homa deleted successfully"
}
```

---

## 5. Pooja Details API
**Base Path:** `/api/pooja-details`

### 5.1 Get Pooja by ID
- **Endpoint:** `/api/pooja-details/:poojaId`
- **Method:** `GET`
- **Auth Required:** No
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "name": "Ganesh Puja",
    "title": "Ganesh Puja",
    "description": "Removes obstacles and brings prosperity.",
    "about": "Detailed about section for Ganesh Puja...",
    "benefits": ["Removes Obstacles", "Brings Success"],
    "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
    "deity": "Lord Ganesha",
    "price": 1000,
    "basePrice": 1000,
    "extraParticipantPrice": 250,
    "maxParticipants": 5,
    "imageUrl": "https://example.com/ganesh-puja.jpg",
    "status": "active",
    "isActive": true
  }
}
```

---

## 6. OTP & Authentication API
**Base Path:** `/api/otp`

### 6.1 Send OTP
- **Endpoint:** `/api/otp/sendOtp`
- **Method:** `POST`
- **Auth Required:** No
- **Rate Limit:** `otpSendLimiter` (Max 5 requests per 10-minute window per IP + mobile key)
- **Security & Constraints:**
  - Enforces a 60-second cooldown between successive OTP requests for the same mobile number.
  - Generates cryptographically secure 6-digit numeric OTPs.
  - OTP values are securely hashed with SHA-256 before storage in MongoDB; plaintext OTP is never logged or stored.
  - SMS gateway credentials and gateway URLs are masked/redacted in backend logs.
- **Payload:**
```json
{
  "mobileNumber": "9360270984"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpSent": true
  }
}
```

### 6.2 Verify OTP & Login
- **Endpoint:** `/api/otp/verifyOtp`
- **Method:** `POST`
- **Auth Required:** No
- **Rate Limit:** `otpVerifyLimiter` (Max 10 requests per 10-minute window per IP + mobile key)
- **Security & Constraints:**
  - Verifies OTP using timing-safe SHA-256 hash comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
  - Atomic attempt counter via MongoDB `$inc: { attempts: 1 }`.
  - Maximum 5 failed verification attempts allowed; exceeding 5 attempts immediately locks out and deletes the OTP record.
  - OTP expires automatically after 10 minutes (enforced via MongoDB TTL and server validation).
- **Payload:**
```json
{
  "mobileNumber": "9360270984",
  "otp": "123456"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "is_user": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "is_user": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6abd0358cd62648ac4fa1c4a",
      "mobileNumber": "9360270984",
      "name": "Jagathratchagan",
      "email": "jagath@example.com",
      "isVerified": true,
      "walletBalance": 0,
      "addresses": []
    },
    "isNewUser": false
  }
}
```

---

## 7. Users API
**Base Path:** `/api/users`

### 7.1 Get User Profile (Self)
- **Endpoint:** `/api/users/profile`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "6abd0358cd62648ac4fa1c4a",
    "name": "Jagathratchagan",
    "email": "jagath@example.com",
    "mobileNumber": "9360270984",
    "addresses": [
      {
        "type": "Home",
        "name": "Jagathratchagan",
        "phone": "9360270984",
        "addressLine1": "No 1, Main Road",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600001",
        "country": "India",
        "isDefault": true
      }
    ],
    "gender": "Male",
    "dob": "1990-01-01",
    "placeOfBirth": "Chennai",
    "occupation": "Software Engineer"
  }
}
```

### 7.2 Get User Profile by ID
- **Endpoint:** `/api/users/profile/:userId`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Enforces resource ownership / IDOR prevention: Non-admin users can only retrieve their own profile matching `req.user.id`. Requesting another user's profile returns `403 Forbidden`.
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "6abd0358cd62648ac4fa1c4a",
    "name": "Jagathratchagan",
    "email": "jagath@example.com",
    "mobileNumber": "9360270984",
    "addresses": [],
    "gender": "Male",
    "dob": "1990-01-01",
    "placeOfBirth": "Chennai",
    "occupation": "Software Engineer"
  }
}
```

### 7.3 Update User Profile
- **Endpoint:** `/api/users/updateProfile`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Validation:**
  - IDOR Protection: Profile updates are strictly pinned to the authenticated user (`req.user.id`). Non-admin users cannot update another user's profile.
  - Strict Email Validation: Enforces genuine email format regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Fabricated placeholder emails are rejected with `400 Bad Request`.
- **Payload:**
```json
{
  "userId": "6abd0358cd62648ac4fa1c4a",
  "name": "Jagathratchagan",
  "email": "jagath.updated@example.com",
  "gender": "Male",
  "dob": "1990-01-01",
  "placeOfBirth": "Chennai",
  "occupation": "Senior Software Engineer",
  "addresses": [
    {
      "type": "Home",
      "name": "Jagathratchagan",
      "phone": "9360270984",
      "addressLine1": "No 1, Main Road",
      "addressLine2": "Near Temple",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "pincode": "600001",
      "country": "India",
      "isDefault": true
    }
  ]
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "6abd0358cd62648ac4fa1c4a",
    "name": "Jagathratchagan",
    "email": "jagath.updated@example.com",
    "mobileNumber": "9360270984",
    "addresses": [
      {
        "type": "Home",
        "name": "Jagathratchagan",
        "phone": "9360270984",
        "addressLine1": "No 1, Main Road",
        "addressLine2": "Near Temple",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600001",
        "country": "India",
        "isDefault": true
      }
    ],
    "gender": "Male",
    "dob": "1990-01-01",
    "placeOfBirth": "Chennai",
    "occupation": "Senior Software Engineer"
  }
}
```

---

## 8. Orders API
**Base Path:** `/api/orders`

### 8.1 Get Order Status (Payment Status Polling)
- **Endpoint:** `/api/orders/status`
- **Method:** `GET`
- **Query Params:** `razorpayOrderId=<string>`
- **Auth Required:** No
- **Rate Limit:** 60 requests per minute
- **Description:** Polling endpoint used by the payment success / review page to read the live database status of an order. Exposes safe order details while omitting sensitive personal devotee information.
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orderId": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "PS-2026-000123",
    "razorpayOrderId": "order_TjGKDZrwmLS1kA",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "amount": 2500,
    "currency": "INR",
    "itemName": "Rameshwaram Tharpanam",
    "bookingDate": "2026-10-12T00:00:00.000Z"
  }
}
```

### 8.2 Preview Order Price & Summary
- **Endpoint:** `/api/orders/preview`
- **Method:** `POST`
- **Auth Required:** No
- **Payload:**
```json
{
  "poojaId": "6abd0362cd62648ac4fa1c4b",
  "participants": [
    {
      "name": "Jagathratchagan"
    }
  ],
  "whatsappNumber": "9360270984",
  "gotra": "shiva gotra",
  "doesNotKnowGotra": false,
  "wish": "For wealth and prosperity.",
  "bookingDate": "2026-10-12T00:00:00.000Z"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "type": "pooja",
    "service": {
      "id": "6abd0362cd62648ac4fa1c4b",
      "name": "Rameshwaram Tharpanam",
      "image": "https://example.com/image.jpg"
    },
    "booking": {
      "whatsappNumber": "9360270984",
      "participants": [
        {
          "name": "Jagathratchagan"
        }
      ],
      "gotra": "shiva gotra",
      "doesNotKnowGotra": false,
      "wish": "For wealth and prosperity.",
      "bookingDate": "2026-10-12T00:00:00.000Z"
    },
    "pricing": {
      "basePrice": 2500,
      "extraParticipantCount": 0,
      "extraParticipantAmount": 0,
      "total": 2500,
      "convenienceFee": 0,
      "panditFee": 0,
      "recordingFee": 0,
      "currency": "INR"
    }
  }
}
```

### 8.3 Get Orders for User
- **Endpoint:** `/api/orders/user` (or `/api/orders/user/:userId`)
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Retrieves orders strictly using the verified account identifier (`customer: req.user.id`), eliminating customer-entered phone regex lookups (IDOR prevention).
  - Unpaid or abandoned orders (`paymentStatus: "pending"`) are filtered out from user order history until successful payment confirmation.
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "6ac06417d6fcac10cf339e5c",
      "pooja": "Rameshwaram Tharpanam",
      "customer": "6abd0358cd62648ac4fa1c4a",
      "customerName": "Jagathratchagan",
      "orderNumber": "200627",
      "whatsappNumber": "9360270984",
      "mobileNumber": "9360270984",
      "participants": [
        {
          "name": "Jagathratchagan"
        }
      ],
      "gotra": "shiva gotra",
      "doesNotKnowGotra": false,
      "wish": "Prayers offered for family happiness and prosperity.",
      "bookingDate": "2026-10-12T00:00:00.000Z",
      "pricing": {
        "basePrice": 2500,
        "extraParticipantCount": 0,
        "extraParticipantAmount": 0,
        "total": 2500,
        "currency": "INR"
      },
      "paymentDetails": {
        "transactionId": "pay_TjGKajdznC2zO8",
        "paymentMethod": "Razorpay",
        "paymentDate": "2026-10-12T01:59:08.972Z"
      },
      "paymentStatus": "paid",
      "orderStatus": "confirmed",
      "createdAt": "2026-10-12T01:59:08.972Z"
    }
  ]
}
```

---

## 9. Wishlist API
**Base Path:** `/api/wishlist`

### 9.1 Add / Remove Item from Wishlist
- **Endpoint:** `/api/wishlist/updateWishlist`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Wishlist mutations are strictly pinned to the authenticated user (`req.user.id`).
- **Payload:**
```json
{
  "itemId": "60d5ecb8b392d700153f93c2",
  "action": "add"
}
```
*(Note: `action` accepts `"add"` or `"remove"`)*
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Wishlist updated successfully",
  "data": {
    "user": "6abd0358cd62648ac4fa1c4a",
    "items": ["60d5ecb8b392d700153f93c2"]
  }
}
```

### 9.2 Get Wishlist by User ID
- **Endpoint:** `/api/wishlist` (or `/api/wishlist/:userId`)
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Pinned to `req.user.id`. Non-admin users cannot read or modify another user's wishlist.
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "60d5ecb8b392d700153f93c2",
        "name": "Ganesh Puja",
        "price": 1000,
        "imageUrl": "https://example.com/ganesh-puja.jpg"
      }
    ]
  }
}
```

---

## 10. Customer Queries API
**Base Path:** `/api/customerQueries`

### 10.1 Create Customer Query / Support Request
- **Endpoint:** `/api/customerQueries`
- **Method:** `POST`
- **Auth Required:** No
- **Payload:**
```json
{
  "userId": "6abd0358cd62648ac4fa1c4a",
  "name": "Jagathratchagan",
  "mobileNumber": "9360270984",
  "email": "jagath@example.com",
  "bookingId": "200627",
  "subject": "Booking Issue",
  "message": "I would like to confirm my booking schedule.",
  "consent": true
}
```
*(Note: `subject` must be one of: `"Booking Issue"`, `"Puja Video Query"`, `"Refund/Cancellation"`, `"Other"`. `mobileNumber` must be 10 digits. `consent` must be `true`)*
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Your request has been submitted successfully",
  "data": {
    "queryId": "6abd0999cd62648ac4fa1c9f",
    "status": "OPEN",
    "createdAt": "2026-10-12T09:20:00.000Z"
  }
}
```

---

## 11. Payments API (Razorpay)
**Base Path:** `/api/payments`

### 11.1 Create Razorpay Order
- **Endpoint:** `/api/payments/create-order`
- **Method:** `POST`
- **Auth Required:** No
- **Security & Constraints:**
  - `orderDetails` object is **strictly mandatory**. Path B (arbitrary direct amount without orderDetails) is completely removed; omitting `orderDetails` returns `400 Bad Request`.
  - Server-side price calculation: The server recomputes prices using `computeServerPrice` based on package base price, per-extra participant fee (₹200), validated offerings, and validated promo discounts.
  - Generates a cryptographically random receipt identifier on the server (`rcpt_<HEX>`).
  - Automatically creates a pending `Order` record in MongoDB with `paymentStatus: "pending"`, `orderStatus: "created"`.
- **Payload:**
```json
{
  "orderDetails": {
    "pooja": "Rameshwaram Tharpanam",
    "serviceId": "6abd0362cd62648ac4fa1c4b",
    "serviceType": "POOJA",
    "customer": "6abd0358cd62648ac4fa1c4a",
    "customerName": "Jagathratchagan",
    "itemName": "Rameshwaram Tharpanam",
    "mobileNumber": "9360270984",
    "whatsappNumber": "919360270984",
    "participants": [
      { "name": "Jagath" },
      { "name": "Friend" }
    ],
    "gotra": "Kashyapa",
    "doesNotKnowGotra": false,
    "wish": "Peace and good health",
    "promoCode": "FESTIVE50",
    "packageId": "pkg-1",
    "offerings": [
      {
        "name": "Vastra Daan",
        "priceINR": 501,
        "description": "Offer sacred clothes to the deity.",
        "imageUrl": "/images/vastra.jpg"
      },
      {
        "name": "Kumkum Archana",
        "priceINR": 101,
        "description": "Offering of Kumkum for blessings.",
        "imageUrl": ""
      }
    ],
    "pricing": {
      "basePrice": 1251,
      "extraParticipantCount": 1,
      "extraParticipantAmount": 200,
      "offeringsAmount": 602,
      "total": 2053
    }
  }
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "order_TjGKDZrwmLS1kA",
    "amount": 205300,
    "currency": "INR",
    "notes": {
      "uniqueId": "A1B2C3D4E5F67890"
    },
    "keyId": "rzp_test_xxxxxx",
    "dbOrderId": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "ORD-123456-7890"
  }
}
```

### 11.2 Verify Payment Signature & Finalize Order
- **Endpoint:** `/api/payments/verify`
- **Method:** `POST`
- **Auth Required:** No
- **Security & Constraints:**
  - Verifies HMAC-SHA256 signature against Razorpay key secret.
  - Fetches original payment status directly from Razorpay gateway API (`fetchRazorpayPayment`).
  - No manual order creation fallback: If no pending order exists for `razorpayOrderId`, returns `404 Not Found` (`"Order not found for the provided payment."`).
  - **Authentic Razorpay status conversion**:
    - **`captured`**: Atomically transitions order to `paid` / `confirmed` via `markOrderPaid`. Returns `200 OK`.
    - **`authorized`**: Updates order to `authorized`. Returns `200 OK`.
    - **`failed`**: Does **NOT** convert the order to paid. Updates order `paymentStatus: "failed"` and returns `400 Bad Request` with `status: "failed"` and the gateway decline reason.
    - **`pending` / `inconclusive`**: Returns `202 Accepted` with `status: "pending"` to guide client to bounded polling.
- **Payload:**
```json
{
  "razorpayOrderId": "order_TjGKDZrwmLS1kA",
  "razorpayPaymentId": "pay_TjGKajdznC2zO8",
  "razorpaySignature": "457b1f686661120c09ba6b0db4794ce1a98ad8e3b8c1fa5e4d90bbda793e6983"
}
```
- **Response (Captured Payment):** `200 OK`
```json
{
  "success": true,
  "status": "captured",
  "message": "Payment verified successfully",
  "data": {
    "razorpayOrderId": "order_TjGKDZrwmLS1kA",
    "razorpayPaymentId": "pay_TjGKajdznC2zO8",
    "orderId": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "ORD-123456-7890"
  }
}
```
- **Response (Failed Payment):** `400 Bad Request`
```json
{
  "success": false,
  "status": "failed",
  "message": "Payment failed at bank or gateway"
}
```

### 11.3 Secure Live Razorpay Webhook
- **Endpoint:** `/api/payments/getRazorpayWebhook`
- **Method:** `POST`
- **Auth Required:** Signature-verified (`X-Razorpay-Signature`, `X-Razorpay-Event-Id`)
- **Headers:**
  - `Content-Type: application/json`
  - `x-razorpay-signature: <hex-digest-of-raw-body-with-RAZORPAY_WEBHOOK_SECRET>`
  - `x-razorpay-event-id: <unique-event-id>`
- **Security & Constraints:**
  - Whitelisted from global rate limiting to prevent dropping webhook notifications.
  - Raw-body buffer verification using `crypto.timingSafeEqual` to avoid timing attacks.
  - Idempotent event processing: records `WebhookEvent` by `eventId`; duplicate events immediately return `200 OK`.
  - Status downgrade protection: a late `payment.failed` event cannot overwrite an already `captured` payment.
  - Converts orders strictly on `payment.captured` or `order.paid` via atomic `markOrderPaid`.
- **Payload:** Standard Razorpay Webhook JSON payload
```json
{
  "entity": "event",
  "account_id": "acc_xxxxxx",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_TjGKajdznC2zO8",
        "entity": "payment",
        "amount": 205300,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_TjGKDZrwmLS1kA",
        "method": "upi",
        "notes": {
          "uniqueId": "A1B2C3D4E5F67890"
        }
      }
    }
  }
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### 11.4 Legacy Razorpay Webhook Callback
- **Endpoint:** `/api/payments/webhook-response`
- **Method:** `POST`
- **Auth Required:** No
- **Description:** Backward compatibility webhook callback.
- **Payload:**
```json
{
  "razorpayres": {
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_TjGKajdznC2zO8",
          "amount": 250000,
          "status": "captured"
        }
      }
    }
  }
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Razorpay webhook response received"
}
```

---

## 12. Promo Codes API
**Base Path:** `/api/promos`

### 12.1 Apply Promo Code (Customer)
- **Endpoint:** `/api/promos/apply`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Case Normalization:**
  - Service type casing: Accepts standard variations (`POOJA`, `HOMA`, `Puja`, `Homa`, `pooja`, `homa`) and normalizes canonically to `POOJA` or `HOMA`.
  - Promo applicability: Checks if code is valid for `"ALL"`, `"POOJA"`, or `"HOMA"`.
  - Validates active status, start/end dates, order minimum amount, total usage limits, and per-user limits.
- **Payload:**
```json
{
  "code": "FESTIVE50",
  "orderAmount": 2000,
  "serviceType": "POOJA",
  "packageId": "6abd0362cd62648ac4fa1c4b",
  "userId": "6abd0358cd62648ac4fa1c4a"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Promo code applied successfully",
  "data": {
    "promoCode": "FESTIVE50",
    "discountType": "PERCENTAGE",
    "discountValue": 50,
    "orderAmount": 2000,
    "discountAmount": 500,
    "finalAmount": 1500
  }
}
```

### 12.2 Get All Promo Codes (Admin)
- **Endpoint:** `/api/promos`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "670985123456789abcdef012",
      "code": "FESTIVE50",
      "description": "50% off on all Pujas up to ₹500",
      "discountType": "PERCENTAGE",
      "discountValue": 50,
      "maxDiscount": 500,
      "minimumOrderAmount": 1000,
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-10-31T23:59:59.000Z",
      "usageLimit": 100,
      "usageLimitPerUser": 1,
      "usedCount": 5,
      "applicableServices": "ALL",
      "applicablePackages": [],
      "isActive": true,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    }
  ]
}
```

### 12.3 Get Promo Code by ID (Admin)
- **Endpoint:** `/api/promos/:id`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "670985123456789abcdef012",
    "code": "FESTIVE50",
    "description": "50% off on all Pujas up to ₹500",
    "discountType": "PERCENTAGE",
    "discountValue": 50,
    "maxDiscount": 500,
    "minimumOrderAmount": 1000,
    "startDate": "2026-10-01T00:00:00.000Z",
    "endDate": "2026-10-31T23:59:59.000Z",
    "usageLimit": 100,
    "usageLimitPerUser": 1,
    "usedCount": 5,
    "applicableServices": "ALL",
    "applicablePackages": [],
    "isActive": true,
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

### 12.4 Create Promo Code (Admin)
- **Endpoint:** `/api/promos`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "code": "DIWALI2026",
  "description": "Flat ₹300 off on orders above ₹1500",
  "discountType": "FIXED",
  "discountValue": 300,
  "maxDiscount": null,
  "minimumOrderAmount": 1500,
  "startDate": "2026-10-15T00:00:00.000Z",
  "endDate": "2026-11-15T23:59:59.000Z",
  "usageLimit": 200,
  "usageLimitPerUser": 1,
  "applicableServices": "ALL",
  "applicablePackages": [],
  "isActive": true
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Promo code created successfully",
  "data": {
    "_id": "670985123456789abcdef013",
    "code": "DIWALI2026",
    "description": "Flat ₹300 off on orders above ₹1500",
    "discountType": "FIXED",
    "discountValue": 300,
    "maxDiscount": null,
    "minimumOrderAmount": 1500,
    "startDate": "2026-10-15T00:00:00.000Z",
    "endDate": "2026-11-15T23:59:59.000Z",
    "usageLimit": 200,
    "usageLimitPerUser": 1,
    "usedCount": 0,
    "applicableServices": "ALL",
    "applicablePackages": [],
    "isActive": true,
    "createdAt": "2026-10-12T09:20:00.000Z",
    "updatedAt": "2026-10-12T09:20:00.000Z"
  }
}
```

### 12.5 Update Promo Code (Admin)
- **Endpoint:** `/api/promos/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "description": "Updated discount details",
  "minimumOrderAmount": 2000
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Promo code updated successfully",
  "data": {
    "_id": "670985123456789abcdef013",
    "code": "DIWALI2026",
    "description": "Updated discount details",
    "discountType": "FIXED",
    "discountValue": 300,
    "minimumOrderAmount": 2000,
    "isActive": true
  }
}
```

### 12.6 Activate / Deactivate Promo Code (Admin)
- **Endpoint:** `/api/promos/:id/status`
- **Method:** `PATCH`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "isActive": false
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Promo code deactivated",
  "data": {
    "_id": "670985123456789abcdef013",
    "code": "DIWALI2026",
    "isActive": false
  }
}
```

### 12.7 Delete Promo Code (Admin)
- **Endpoint:** `/api/promos/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Promo code deleted successfully"
}
```

---

## 13. WhatsApp Notifications API
**Base Path:** `/api/whatsapp`

### 13.1 Register WhatsApp Opt-in
- **Endpoint:** `/api/whatsapp/opt-in`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Enforces phone ownership: User can only register opt-in consent for their own verified mobile number. Providing a mobile number belonging to another devotee returns `403 Forbidden`.
- **Payload:**
```json
{
  "mobileNumber": "9360270984",
  "consent": true
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Customer opt-in registered",
  "data": {
    "alreadyOptedIn": false,
    "consentStatus": "active"
  }
}
```

### 13.2 Register WhatsApp Opt-out
- **Endpoint:** `/api/whatsapp/opt-out`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <user_token>`)
- **Security & Authorization:**
  - Revokes WhatsApp notifications consent for the authenticated user and sets `optedOutAt` timestamp in MongoDB.
- **Payload:**
```json
{
  "mobileNumber": "9360270984"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Customer opt-out registered"
}
```

### 13.3 Send WhatsApp Order Confirmation
- **Endpoint:** `/api/whatsapp/order-confirmation`
- **Method:** `POST`
- **Auth Required:** No (Internal / payment service triggered)
- **Payload:**
```json
{
  "mobileNumber": "919360270984",
  "customerName": "Jagathratchagan",
  "orderId": "200627",
  "serviceName": "Ganesh Homa",
  "bookingDate": "2026-10-25T10:00:00Z",
  "amount": 2500
}
```
*(Note: Mobile numbers are automatically formatted with the `91` country code prefix for 10-digit Indian numbers)*
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Confirmation request accepted by Netcore",
  "data": {
    "messageId": "msg_12345"
  }
}
```

---

## 14. Admin Management API
**Base Path:** `/api/admin`

### 14.1 Admin Login
- **Endpoint:** `/api/admin/login`
- **Method:** `POST`
- **Auth Required:** No
- **Rate Limit:** `loginLimiter` (Strict rate limit on consecutive attempts)
- **Security & Input Sanitization:**
  - Validates email format using regex; rejects malformed inputs with `400 Bad Request`.
  - Enforces password string type check to prevent NoSQL operator injection.
  - Issues dedicated `adminToken` with admin claim verification.
- **Payload:**
```json
{
  "email": "admin@astroved.com",
  "password": "StrongAdminPassword123!"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "6abd0358cd62648ac4fa1c4a",
    "email": "admin@astroved.com",
    "name": "Super Admin"
  }
}
```

### 14.2 Get Admin Dashboard Stats
- **Endpoint:** `/api/admin/stats`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pujas": 12,
    "homas": 8,
    "orders": 150,
    "revenue": 525000,
    "recentBookings": [
      {
        "_id": "6ac06417d6fcac10cf339e5c",
        "pooja": {
          "_id": "6abd0362cd62648ac4fa1c4b",
          "title": "Rameshwaram Tharpanam",
          "imageUrl": "https://example.com/image.jpg"
        },
        "customerName": "Jagathratchagan",
        "orderNumber": "200627",
        "whatsappNumber": "9360270984",
        "pricing": {
          "total": 2500,
          "currency": "INR"
        },
        "paymentStatus": "paid",
        "createdAt": "2026-10-12T01:59:08.972Z"
      }
    ]
  }
}
```

### 14.3 Get Admin Orders (With Filters & Pagination)
- **Endpoint:** `/api/admin/orders`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Query Parameters:**
  - `page` (number, default: `1`)
  - `limit` (number, default: `5`)
  - `service` (string, default: `"All"`)
  - `status` (string, default: `"All"`)
  - `search` (string, default: `""`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "6ac06417d6fcac10cf339e5c",
      "serviceName": "Rameshwaram Tharpanam",
      "devoteeName": "Jagathratchagan",
      "orderNumber": "200627",
      "whatsappNumber": "9360270984",
      "pricing": {
        "total": 2500,
        "currency": "INR"
      },
      "paymentStatus": "paid",
      "orderStatus": "scheduled",
      "scheduledDate": "2026-10-25T05:30:00.000Z",
      "videoLink": "https://youtube.com/live/example123",
      "createdAt": "2026-10-12T01:59:08.972Z"
    }
  ],
  "totalOrders": 1,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 5,
  "services": ["All", "Rameshwaram Tharpanam"],
  "statuses": ["All", "paid", "scheduled", "completed"]
}
```

### 14.4 Bulk Schedule Orders by Service
- **Endpoint:** `/api/admin/orders/bulk-schedule`
- **Method:** `POST`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "service": "Rameshwaram Tharpanam",
  "scheduledDate": "2026-10-25T05:30:00.000Z"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully updated 12 orders.",
  "count": 12
}
```

### 14.5 Update Single Order Status & Video Link
- **Endpoint:** `/api/admin/orders/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:**
```json
{
  "orderStatus": "completed",
  "scheduledDate": "2026-10-25T05:30:00.000Z",
  "videoLink": "https://youtube.com/live/example123"
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "6ac06417d6fcac10cf339e5c",
    "orderStatus": "completed",
    "scheduledDate": "2026-10-25T05:30:00.000Z",
    "videoLink": "https://youtube.com/live/example123"
  }
}
```

### 14.6 Get Admin Payments Analytics
- **Endpoint:** `/api/admin/payments`
- **Method:** `GET`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Payload:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 525000,
    "monthlyRevenue": 45000,
    "successfulPayments": 125,
    "pendingPayments": 25,
    "recentTransactions": [
      {
        "transactionId": "pay_TjGKajdznC2zO8",
        "devoteeName": "Jagathratchagan",
        "method": "Razorpay",
        "amount": 2500,
        "status": "paid",
        "currency": "INR"
      }
    ]
  }
}
```
