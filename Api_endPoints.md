# Priest Services API Documentation

Official, comprehensive REST API specification for Priest Services backend. This document is organized by user roles and application flows (Client Devotee Website vs. Admin Management Portal).

- **Production Base URL:** `https://priestservices.astroved.com`
- **Local Development Base URL:** `http://localhost:8564`
- **Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)

---

## Architecture & Authentication Overview

### 1. Devotee Authentication
- Devotees authenticate via SMS OTP.
- Upon verification, the backend issues a JSON Web Token (JWT).
- Protected devotee endpoints require the header:  
  `Authorization: Bearer <user_jwt_token>`

### 2. Admin Authentication
- Admins authenticate via secure email and password.
- Upon successful login, the backend issues an Admin JWT with `role: "admin"`.
- All admin endpoints require:  
  `Authorization: Bearer <admin_jwt_token>`

### 3. Standard HTTP Status Codes
| Code | Meaning |
|---|---|
| `200 OK` | Request completed successfully. |
| `201 Created` | New record created successfully. |
| `400 Bad Request` | Validation error or missing required fields. |
| `401 Unauthorized` | Missing, invalid, or expired JWT token. |
| `403 Forbidden` | Insufficient permissions (e.g. non-admin attempting admin operation). |
| `404 Not Found` | Requested resource does not exist. |
| `409 Conflict` | Duplicate resource (e.g. image name already exists). |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unhandled server error. |

---

## Table of Contents

### PART 1: Devotee & Client Website APIs
1. [Authentication & OTP](#1-authentication--otp-client)
2. [Catalog & Discovery (Pujas, Homas, Banners)](#2-catalog--discovery-client)
3. [User Profile & Address Book](#3-user-profile--address-book-client)
4. [Wishlist](#4-wishlist-client)
5. [Cart, Checkout & Pricing](#5-cart-checkout--pricing-client)
6. [Payments & Razorpay Integration](#6-payments--razorpay-integration-client)
7. [Devotee Orders & Livestream Tracking](#7-devotee-orders--livestream-tracking-client)
8. [WhatsApp Notifications & Consent](#8-whatsapp-notifications--consent-client)
9. [Customer Support & Inquiries](#9-customer-support--inquiries-client)

### PART 2: Admin Portal Management APIs
10. [Admin Authentication](#10-admin-authentication)
11. [Admin Analytics & KPI Dashboard](#11-admin-analytics--kpi-dashboard)
12. [Admin Order Management & Livestream Scheduling](#12-admin-order-management--livestream-scheduling)
13. [Admin Devotee User Management](#13-admin-devotee-user-management)
14. [Admin Puja & Ritual Catalog Management](#14-admin-puja--ritual-catalog-management)
15. [Admin Homa Catalog Management](#15-admin-homa-catalog-management)
16. [Admin Hero Banner Management](#16-admin-hero-banner-management)
17. [Admin Promo Code Management](#17-admin-promo-code-management)
18. [Admin Media Library & Asset Upload](#18-admin-media-library--asset-upload)

### PART 3: Webhooks & System Operations
19. [Razorpay Webhook](#19-razorpay-webhook)
20. [System Health Check](#20-system-health-check)

---

# PART 1: Devotee & Client Website APIs

## 1. Authentication & OTP (Client)

### 1.1 Send Login / Verification OTP
Initiates mobile verification by sending a 6-digit numeric OTP via SMS.
- **Endpoint:** `POST /api/otp/sendOtp`
- **Auth Required:** No
- **Rate Limit:** 3 requests per 10 minutes per IP / mobile
- **Request Payload:**
```json
{
  "mobileNumber": "9876543210"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "OTP sent successfully to 9876543210"
}
```
- **Error Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Valid 10-digit mobile number is required"
}
```

---

### 1.2 Verify OTP & Login
Validates the SMS OTP. If the user does not exist, an account is automatically created. Returns a signed JWT token and devotee user profile.
- **Endpoint:** `POST /api/otp/verifyOtp`
- **Auth Required:** No
- **Rate Limit:** 5 verification attempts per 10 minutes
- **Request Payload:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "458921"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ecb8b392d700153f93c7",
    "name": "Devotee Name",
    "mobileNumber": "9876543210",
    "whatsappNumber": "9876543210",
    "email": "devotee@example.com",
    "role": "user",
    "isVerified": true
  }
}
```
- **Error Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP. Please try again."
}
```

---

## 2. Catalog & Discovery (Client)

### 2.1 Get All Pujas (With Auto-Calculated Recurring Dates)
Retrieves the list of all available pujas. Auspicious recurring dates (Saturdays for Shani Puja, Sundays for Navagraha Puja, Amavasya for Rameshwaram Tharpanam) are calculated dynamically in Indian Standard Time (IST) and synchronized.
- **Endpoint:** `GET /api/pujas`
- **Auth Required:** No
- **Query Parameters:** None
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "6abd0334cd62648ac4fa1c49",
      "title": "Shani Dosha Nivarana Puja",
      "slug": "shani-dosha-nivarana-puja",
      "shortTitle": "Shani Puja",
      "subtitle": "Shani Dosha relief",
      "badge": "Popular",
      "description": "Seek Shani's grace through a traditional Vedic puja.",
      "imageUrl": "/images/shani_puja.png",
      "location": "AstroVed Homa Center, Chennai, Tamil Nadu",
      "date": "07-11-2026",
      "eventDateTime": "2026-11-07T02:30:00.000Z",
      "time": "08:00 AM to 09:00 AM",
      "deity": "Lord Shani",
      "tithis": "Every Saturday",
      "dosha": "Shani Dosha",
      "benefit": "Career & Stability",
      "packages": [
        {
          "name": "Individual Puja",
          "priceINR": 525,
          "priceUSD": 7,
          "priceMYR": 32,
          "description": "1 Devotee Sankalp"
        },
        {
          "name": "Couple Puja",
          "priceINR": 1001,
          "priceUSD": 13,
          "priceMYR": 60,
          "description": "2 Devotees Sankalp"
        },
        {
          "name": "Family Puja",
          "priceINR": 2500,
          "priceUSD": 32,
          "priceMYR": 150,
          "description": "Up to 4 Family Members"
        }
      ],
      "offerings": [
        {
          "_id": "6ac34786f7cfde13bd902398",
          "name": "Sesame Oil Archana",
          "priceINR": 251,
          "description": "Special archana with sacred sesame oil."
        }
      ],
      "trustBadges": [
        "Puja Video Delivered Within 48 hours",
        "Verified & Experienced Pandits",
        "Puja Performed in Sacred Temples",
        "100% Authentic Vedic Rituals"
      ]
    }
  ]
}
```

---

### 2.2 Get Single Puja Details by ID or Slug
Retrieves comprehensive details for a specific puja including rituals, benefits, step-by-step process, FAQs, packages, and offerings.
- **Endpoint:** `GET /api/pujas/:id`
- **Auth Required:** No
- **URL Parameters:**
  - `:id` (MongoDB `_id` or clean `slug` e.g. `rameshwaram-tharpanam`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6abd0362cd62648ac4fa1c4b",
    "title": "Rameshwaram Tharpanam",
    "slug": "rameshwaram-tharpanam",
    "subtitle": "Sacred Ancestral Offering",
    "description": "Traditional Tharpanam performed at sacred Rameshwaram.",
    "imageUrl": "/Service images/rameshwaram_puja.png",
    "date": "08-11-2026",
    "time": "09:00 AM to 11:00 AM",
    "eventDateTime": "2026-11-08T03:30:00.000Z",
    "location": "Ramanathaswamy Temple, Rameshwaram, Tamil Nadu",
    "about": "Tharpanam is the essential ritual to resolve Pitru karma...",
    "benefits": [
      {
        "title": "Relief from Pitru Dosha",
        "description": "Helps appease ancestral souls and clear roadblocks."
      }
    ],
    "process": [
      {
        "title": "Sankalpam",
        "description": "Making sacred resolve with devotee details."
      }
    ],
    "packages": [
      {
        "name": "Individual Puja",
        "priceINR": 1,
        "description": "1 Devotee Sankalp"
      }
    ]
  }
}
```

---

### 2.3 Get All Homas
Retrieves all active Vedic fire lab (Homa) services.
- **Endpoint:** `GET /api/homas`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6ac14980de79cf10de45681a",
      "title": "Maha Ganapati Homa",
      "slug": "maha-ganapati-homa",
      "subtitle": "Obstacle Removal & New Beginnings",
      "imageUrl": "/images/ganapathi_homa.png",
      "location": "AstroVed Fire Lab, Chennai",
      "packages": [
        {
          "name": "Standard Homa",
          "priceINR": 3500,
          "priceUSD": 45,
          "priceMYR": 210
        }
      ]
    }
  ]
}
```

---

### 2.4 Get Single Homa Details by ID or Slug
- **Endpoint:** `GET /api/homas/:id`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6ac14980de79cf10de45681a",
    "title": "Maha Ganapati Homa",
    "slug": "maha-ganapati-homa",
    "subtitle": "Obstacle Removal",
    "about": "Maha Ganapati Homa invokes Lord Ganesha to remove obstacles...",
    "packages": [
      {
        "name": "Standard Homa",
        "priceINR": 3500,
        "description": "Complete fire lab ritual with dedicated priests."
      }
    ]
  }
}
```

---

### 2.5 Get Active Hero Banners
Retrieves promotional hero banners for home and catalog pages.
- **Endpoint:** `GET /api/hero-banners`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c1",
      "title": "Perform Sacred Tharpanam at Rameshwaram",
      "tagLine": "Ancestral Blessings",
      "description": "Appease your ancestors on this upcoming Amavasya.",
      "cta": {
        "text": "Book My Puja",
        "url": "/puja/rameshwaram-tharpanam"
      },
      "imageUrl": "/images/banner_rameshwaram.jpg",
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

---

## 3. User Profile & Address Book (Client)

### 3.1 Get Devotee Profile (Self)
Retrieves the authenticated devotee's profile, including saved gotra, family details, and address book.
- **Endpoint:** `GET /api/users/profile`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "60d5ecb8b392d700153f93c7",
    "name": "Jagathratchagan",
    "email": "devotee@example.com",
    "mobileNumber": "9876543210",
    "whatsappNumber": "9876543210",
    "gender": "Male",
    "dob": "1995-05-15",
    "placeOfBirth": "Chennai",
    "addresses": [
      {
        "_id": "6ac21498af920cf10de45681",
        "type": "Home",
        "name": "Jagathratchagan",
        "phone": "9876543210",
        "addressLine1": "No. 45 Temple Street",
        "addressLine2": "Mylapore",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600004"
      }
    ]
  }
}
```

---

### 3.2 Update Devotee Profile & Addresses
Updates personal information, WhatsApp contact, or adds/modifies delivery addresses for prasadam shipment.
- **Endpoint:** `PUT /api/users/updateProfile`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Request Payload:**
```json
{
  "name": "Jagathratchagan S",
  "email": "updated_email@example.com",
  "whatsappNumber": "9876543210",
  "gender": "Male",
  "addresses": [
    {
      "type": "Home",
      "name": "Jagathratchagan S",
      "phone": "9876543210",
      "addressLine1": "No. 45 Temple Street",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "pincode": "600004"
    }
  ]
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "60d5ecb8b392d700153f93c7",
    "name": "Jagathratchagan S",
    "email": "updated_email@example.com",
    "whatsappNumber": "9876543210"
  }
}
```

---

## 4. Wishlist (Client)

### 4.1 Toggle Wishlist Item (Add / Remove)
Adds or removes a puja or homa from the devotee's saved rituals.
- **Endpoint:** `POST /api/wishlist/updateWishlist`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Request Payload:**
```json
{
  "userId": "60d5ecb8b392d700153f93c7",
  "itemId": "6abd0334cd62648ac4fa1c49",
  "itemType": "Pooja"
}
```
*(itemType must be `"Pooja"` or `"Homa"`)*
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Item added to wishlist successfully",
  "action": "added"
}
```

---

### 4.2 Get Devotee Wishlist
Retrieves all rituals saved by the user.
- **Endpoint:** `GET /api/wishlist/:userId`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "poojas": [
      {
        "_id": "6abd0334cd62648ac4fa1c49",
        "title": "Shani Dosha Nivarana Puja",
        "slug": "shani-dosha-nivarana-puja",
        "imageUrl": "/images/shani_puja.png",
        "date": "07-11-2026"
      }
    ],
    "homas": []
  }
}
```

---

## 5. Cart, Checkout & Pricing (Client)

### 5.1 Preview Order Price Calculation
Calculates the exact billing breakdown before initiating payment. Computes base package price, extra participant fees, optional offerings, and promo discounts.
- **Endpoint:** `POST /api/orders/preview`
- **Auth Required:** No (Optional auth supported)
- **Request Payload:**
```json
{
  "serviceId": "6abd0362cd62648ac4fa1c4b",
  "serviceType": "Puja",
  "packageName": "Individual Puja",
  "participants": [
    {
      "name": "Devotee Name",
      "gotra": "Kashyapa",
      "doesNotKnowGotra": false
    }
  ],
  "offerings": [
    {
      "name": "Pitru Shanti Goseva",
      "priceINR": 201
    }
  ],
  "promoCode": "FESTIVE100",
  "currency": "INR"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "pricing": {
    "basePrice": 1,
    "extraParticipantCount": 0,
    "extraParticipantAmount": 0,
    "offeringsAmount": 201,
    "originalAmount": 202,
    "discountAmount": 100,
    "total": 102,
    "currency": "INR"
  },
  "promoCode": "FESTIVE100"
}
```

---

### 5.2 Validate & Apply Promo Code
Allows devotees to verify a discount code and see savings before checkout.
- **Endpoint:** `POST /api/promos/apply`
- **Auth Required:** No
- **Request Payload:**
```json
{
  "code": "DIWALI500",
  "cartTotal": 2500
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Promo code applied successfully",
  "data": {
    "code": "DIWALI500",
    "discountType": "fixed",
    "discountValue": 500,
    "discountAmount": 500,
    "finalAmount": 2000
  }
}
```
- **Error Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Minimum order value of INR 1000 required for this promo code."
}
```

---

## 6. Payments & Razorpay Integration (Client)

### 6.1 Create Razorpay Payment Order
Reserves the order in MongoDB with `paymentStatus: "pending"` and initializes a Razorpay order ID.
- **Endpoint:** `POST /api/payments/create-order`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Request Payload:**
```json
{
  "serviceId": "6abd0362cd62648ac4fa1c4b",
  "serviceType": "Puja",
  "packageName": "Individual Puja",
  "customerName": "Jagathratchagan",
  "mobileNumber": "9876543210",
  "whatsappNumber": "9876543210",
  "participants": [
    {
      "name": "Jagathratchagan",
      "gotra": "Kashyapa",
      "doesNotKnowGotra": false
    }
  ],
  "wish": "Seeking health, peace and ancestral liberation.",
  "offerings": [
    {
      "name": "Pitru Shanti Goseva",
      "priceINR": 201
    }
  ],
  "promoCode": "FESTIVE100",
  "currency": "INR"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "razorpayOrderId": "order_Rz91048KLAjd01",
  "amount": 10200,
  "currency": "INR",
  "orderNumber": "PS-2026-000108",
  "keyId": "rzp_test_lHaqA31HDZDSHE"
}
```
*(amount is returned in paise for the Razorpay Checkout SDK)*

---

### 6.2 Verify Payment Signature & Confirm Booking
Called by the client immediately after Razorpay checkout returns the payment signature. Cryptographically verifies HMAC SHA-256 and marks order as `paid` & `confirmed`.
- **Endpoint:** `POST /api/payments/verify`
- **Auth Required:** No (Optional auth supported)
- **Request Payload:**
```json
{
  "razorpay_order_id": "order_Rz91048KLAjd01",
  "razorpay_payment_id": "pay_TjGKajdznC2zO8",
  "razorpay_signature": "e5b8d0c2e987f61ad8394bc1234..."
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Payment verified and booking confirmed successfully",
  "order": {
    "_id": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "PS-2026-000108",
    "orderStatus": "confirmed",
    "paymentStatus": "paid",
    "paymentDetails": {
      "transactionId": "pay_TjGKajdznC2zO8",
      "paymentMethod": "Razorpay",
      "paymentDate": "2026-10-30T10:00:00.000Z"
    }
  }
}
```

---

## 7. Devotee Orders & Livestream Tracking (Client)

### 7.1 Get Order Status (Payment Status Polling)
Used by payment success and confirmation redirect pages to poll until the webhook or verification confirms the order.
- **Endpoint:** `GET /api/orders/status`
- **Auth Required:** No
- **Query Parameters:**
  - `orderNumber` (e.g. `PS-2026-000108`) OR `transactionId`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "status": "paid",
  "orderStatus": "confirmed",
  "orderNumber": "PS-2026-000108",
  "scheduledDate": "2026-11-08T03:30:00.000Z",
  "videoLink": "https://youtube.com/live/priest-service-live"
}
```

---

### 7.2 Get Devotee Order History
Retrieves all orders booked by the authenticated devotee.
- **Endpoint:** `GET /api/orders/user/:userId`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6ac06417d6fcac10cf339e5c",
      "orderNumber": "PS-2026-000108",
      "itemName": "Rameshwaram Tharpanam",
      "bookingDate": "2026-10-30T09:00:00.000Z",
      "scheduledDate": "2026-11-08T03:30:00.000Z",
      "orderStatus": "confirmed",
      "paymentStatus": "paid",
      "pricing": {
        "total": 102,
        "currency": "INR"
      },
      "videoLink": "https://youtube.com/live/priest-service-live"
    }
  ]
}
```

---

## 8. WhatsApp Notifications & Consent (Client)

### 8.1 Register WhatsApp Opt-in
Registers the devotee's WhatsApp number to receive ritual timing updates and livestream recording links.
- **Endpoint:** `POST /api/whatsapp/opt-in`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Request Payload:**
```json
{
  "phone": "9876543210"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "WhatsApp updates opt-in registered successfully"
}
```

---

### 8.2 Register WhatsApp Opt-out
- **Endpoint:** `POST /api/whatsapp/opt-out`
- **Auth Required:** Yes (`Authorization: Bearer <user_jwt_token>`)
- **Request Payload:**
```json
{
  "phone": "9876543210"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Opted out from WhatsApp notifications"
}
```

---

## 9. Customer Support & Inquiries (Client)

### 9.1 Submit Customer Inquiry / Help Request
Used by contact forms, footer queries, or "Book via WhatsApp/Call" assistance popups.
- **Endpoint:** `POST /api/customerQueries`
- **Auth Required:** No
- **Request Payload:**
```json
{
  "name": "Devotee Name",
  "email": "devotee@example.com",
  "phone": "9876543210",
  "message": "I would like guidance on selecting the right homa for career growth.",
  "subject": "Puja Consultation"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Your query has been submitted. Our Vedic priest team will contact you shortly."
}
```

---

# PART 2: Admin Portal Management APIs

## 10. Admin Authentication

### 10.1 Admin Login
Authenticates an administrator with email and password, returning an elevated JWT.
- **Endpoint:** `POST /api/admin/login`
- **Auth Required:** No
- **Rate Limit:** 5 failed attempts per 15 minutes
- **Request Payload:**
```json
{
  "email": "admin@astroved.com",
  "password": "astroved_admin_2026"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "60d5ecb8b392d700153f93a1",
    "name": "Super Admin",
    "email": "admin@astroved.com",
    "role": "admin"
  }
}
```

---

## 11. Admin Analytics & KPI Dashboard

### 11.1 Get Dashboard Statistics & Metrics
Returns summary metrics for the admin overview dashboard.
- **Endpoint:** `GET /api/admin/stats`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 128,
    "activePujas": 3,
    "activeHomas": 2,
    "totalRevenue": 245000,
    "pendingOrders": 14,
    "completedOrders": 98
  }
}
```

---

### 11.2 Get Admin Financial & Payment Breakdown
Returns financial aggregates, revenue counts, and recent transaction records.
- **Endpoint:** `GET /api/admin/payments`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 245000,
    "monthlyRevenue": 48500,
    "successfulPayments": 120,
    "pendingPayments": 8,
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

---

## 12. Admin Order Management & Livestream Scheduling

### 12.1 Get Orders List (With Filters, Search & Pagination)
- **Endpoint:** `GET /api/admin/orders`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Query Parameters:**
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
  - `search` (optional, matches devotee name, phone, or orderNumber)
  - `service` (optional, ritual filter e.g. `"Shani Dosha Nivarana Puja"`)
  - `status` (optional, `"paid"`, `"scheduled"`, `"completed"`, `"refunded"`)
  - `date` (optional, ISO date e.g. `2026-11-08`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6ac06417d6fcac10cf339e5c",
      "orderNumber": "PS-2026-000108",
      "serviceName": "Rameshwaram Tharpanam",
      "devoteeName": "Jagathratchagan",
      "whatsappNumber": "9876543210",
      "orderStatus": "confirmed",
      "paymentStatus": "paid",
      "scheduledDate": "2026-11-08T03:30:00.000Z",
      "videoLink": "https://youtube.com/live/priest-service-live",
      "createdAt": "2026-10-30T09:00:00.000Z"
    }
  ],
  "totalOrders": 1,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 10,
  "services": ["All", "Rameshwaram Tharpanam", "Shani Dosha Nivarana Puja"],
  "statuses": ["All", "created", "confirmed", "scheduled", "completed", "refunded"]
}
```

---

### 12.2 Get Single Order Details by ID
- **Endpoint:** `GET /api/admin/orders/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "PS-2026-000108",
    "customer": {
      "_id": "60d5ecb8b392d700153f93c7",
      "name": "Jagathratchagan",
      "email": "devotee@example.com",
      "mobileNumber": "9876543210"
    },
    "participants": [
      {
        "name": "Jagathratchagan",
        "gotra": "Kashyapa"
      }
    ],
    "wish": "Ancestral peace and blessings",
    "orderStatus": "confirmed",
    "paymentStatus": "paid",
    "pricing": {
      "total": 102,
      "currency": "INR"
    }
  }
}
```

---

### 12.3 Update Single Order (Status, Scheduled Date, Video Link, Refunds)
Updates order progression. When set to `"refunded"`, automatically adjusts `paymentStatus: "refunded"`.
- **Endpoint:** `PUT /api/admin/orders/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "orderStatus": "completed",
  "scheduledDate": "2026-11-08T03:30:00.000Z",
  "videoLink": "https://youtube.com/live/recording-xyz"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "6ac06417d6fcac10cf339e5c",
    "orderStatus": "completed",
    "scheduledDate": "2026-11-08T03:30:00.000Z",
    "videoLink": "https://youtube.com/live/recording-xyz"
  }
}
```

---

### 12.4 Bulk Schedule Orders by Service
Allows admins to schedule all paid bookings for a ritual on an upcoming date in one action.
- **Endpoint:** `POST /api/admin/orders/bulk-schedule`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "service": "Rameshwaram Tharpanam",
  "scheduledDate": "2026-11-08T03:30:00.000Z"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Successfully updated 15 orders.",
  "count": 15
}
```

---

## 13. Admin Devotee User Management

### 13.1 Get Devotees List (With Search, Spend & Pagination)
- **Endpoint:** `GET /api/admin/users`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Query Parameters:**
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
  - `search` (optional, devotee name, mobile, email)
  - `status` (optional, `Active` / `Inactive`)
  - `sortBy` (optional, `createdAt` / `totalSpent` / `name`)
  - `sortOrder` (optional, `asc` / `desc`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "60d5ecb8b392d700153f93c7",
        "name": "Jagathratchagan",
        "email": "devotee@example.com",
        "mobileNumber": "9876543210",
        "whatsappNumber": "9876543210",
        "totalAmountSpent": 5100,
        "isVerified": true,
        "status": "Active",
        "createdAt": "2026-10-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    },
    "stats": {
      "totalUsers": 45,
      "activeUsers": 42,
      "totalRevenue": 245000
    }
  }
}
```

---

### 13.2 Update Devotee User (Admin)
- **Endpoint:** `PUT /api/admin/users/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "name": "Jagathratchagan S",
  "email": "devotee@example.com",
  "mobileNumber": "9876543210",
  "whatsappNumber": "9876543210",
  "isVerified": true
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### 13.3 Delete Devotee User (Admin)
- **Endpoint:** `DELETE /api/admin/users/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 14. Admin Puja & Ritual Catalog Management

### 14.1 Create New Puja
- **Endpoint:** `POST /api/pujas`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "title": "Maha Mrityunjaya Puja",
  "slug": "maha-mrityunjaya-puja",
  "subtitle": "Conquering Health Challenges & Longevity",
  "description": "Vedic ritual for rejuvenation and long life.",
  "imageUrl": "/images/mrityunjaya_puja.png",
  "location": "AstroVed Homa Center, Chennai",
  "date": "15-11-2026",
  "eventDateTime": "2026-11-15T02:30:00.000Z",
  "deity": "Lord Shiva",
  "status": "active",
  "packages": [
    {
      "name": "Individual",
      "priceINR": 1500,
      "description": "Individual Sankalpam"
    }
  ]
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Puja created successfully",
  "data": {
    "_id": "6ac34786f7cfde13bd90239c",
    "title": "Maha Mrityunjaya Puja",
    "slug": "maha-mrityunjaya-puja"
  }
}
```

---

### 14.2 Update Puja Details
- **Endpoint:** `PUT /api/pujas/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:** Same fields as create.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Puja updated successfully"
}
```

---

### 14.3 Delete Puja
- **Endpoint:** `DELETE /api/pujas/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Puja deleted successfully"
}
```

---

## 15. Admin Homa Catalog Management

### 15.1 Create Homa
- **Endpoint:** `POST /api/homas`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "title": "Sudarshana Homa",
  "slug": "sudarshana-homa",
  "subtitle": "Protection from Negative Energies",
  "description": "Powerful fire ritual invoking Lord Sudarshana.",
  "imageUrl": "/images/sudarshana_homa.png",
  "packages": [
    {
      "name": "Standard Homa",
      "priceINR": 4500
    }
  ]
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Homa created successfully"
}
```

---

### 15.2 Update Homa
- **Endpoint:** `PUT /api/homas/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Homa updated successfully"
}
```

---

### 15.3 Delete Homa
- **Endpoint:** `DELETE /api/homas/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Homa deleted successfully"
}
```

---

## 16. Admin Hero Banner Management

### 16.1 Create Hero Banner
- **Endpoint:** `POST /api/hero-banners`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "title": "Karthigai Deepam Special Puja",
  "tagLine": "Festival of Lights",
  "description": "Light lamps at sacred Thiruvannamalai temple.",
  "cta": {
    "text": "Book Now",
    "url": "/puja/karthigai-deepam"
  },
  "imageUrl": "/images/deepam_banner.jpg",
  "isActive": true,
  "displayOrder": 1
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Banner created successfully"
}
```

---

### 16.2 Update Hero Banner
- **Endpoint:** `PUT /api/hero-banners/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Banner updated successfully"
}
```

---

### 16.3 Delete Hero Banner
- **Endpoint:** `DELETE /api/hero-banners/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## 17. Admin Promo Code Management

### 17.1 Get All Promo Codes
- **Endpoint:** `GET /api/promos`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c8",
      "code": "FESTIVE100",
      "discountType": "fixed",
      "discountValue": 100,
      "minOrderAmount": 500,
      "isActive": true,
      "expiryDate": "2026-12-31T23:59:59.000Z"
    }
  ]
}
```

---

### 17.2 Create Promo Code
- **Endpoint:** `POST /api/promos`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "code": "DIWALI500",
  "discountType": "fixed",
  "discountValue": 500,
  "minOrderAmount": 2000,
  "maxDiscountAmount": 500,
  "expiryDate": "2026-11-15T23:59:59.000Z",
  "usageLimit": 100
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Promo code created successfully"
}
```

---

### 17.3 Toggle Promo Code Active Status
- **Endpoint:** `PATCH /api/promos/:id/status`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Request Payload:**
```json
{
  "isActive": false
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Promo code status updated"
}
```

---

### 17.4 Delete Promo Code
- **Endpoint:** `DELETE /api/promos/:id`
- **Auth Required:** Yes (`Authorization: Bearer <admin_token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Promo code deleted successfully"
}
```

---

## 18. Admin Media Library & Asset Upload

### 18.1 Upload Image File
Uploads images directly to the server asset directory (`server/public/images`) and creates a record in MongoDB.
- **Endpoint:** `POST /api/upload`
- **Auth Required:** No (Admin portal frontend)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `image` (Binary file: .png, .jpg, .jpeg, .webp, max 5MB)
  - `customName` (optional string): clean slug identifier
  - `overwrite` (optional boolean / `"true"`): overwrites existing file without conflict error
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "_id": "6ac34786f7cfde13bd90239b",
    "filename": "shani-pooja-banner.png",
    "originalName": "banner.png",
    "url": "/images/shani-pooja-banner.png",
    "mimeType": "image/png",
    "size": 145220
  },
  "url": "/images/shani-pooja-banner.png"
}
```

---

### 18.2 Get All Uploaded Images (Media Library)
- **Endpoint:** `GET /api/upload`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "_id": "6ac34786f7cfde13bd90239b",
      "filename": "shani-pooja-banner.png",
      "url": "/images/shani-pooja-banner.png",
      "mimeType": "image/png",
      "size": 145220,
      "createdAt": "2026-10-30T10:00:00.000Z"
    }
  ]
}
```

---

### 18.3 Delete Image from Storage & Database
- **Endpoint:** `DELETE /api/upload/:filename`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Image deleted successfully from server storage and database."
}
```

---

# PART 3: Webhooks & System Operations

## 19. Razorpay Webhook

### 19.1 Payment Webhook Notification
Receives server-to-server notifications directly from Razorpay. Verifies HMAC SHA-256 signature using `RAZORPAY_WEBHOOK_SECRET` against the raw request body. Automatically marks the associated order as `paid` and triggers order confirmation workflows.
- **Endpoint:** `POST /api/payments/getRazorpayWebhook`
- **Auth Required:** Verified via `x-razorpay-signature` header
- **Supported Events:**
  - `order.paid`
  - `payment.captured`
  - `payment.failed`
- **Sample Webhook Payload:**
```json
{
  "entity": "event",
  "account_id": "acc_BFsOcGQ9GpvD4C",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_TjGKajdznC2zO8",
        "amount": 10200,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_Rz91048KLAjd01",
        "method": "upi",
        "email": "devotee@example.com",
        "contact": "+919876543210"
      }
    }
  },
  "created_at": 1729864200
}
```
- **Response (`200 OK`):**
```json
{
  "received": true
}
```

---

## 20. System Health Check

### 20.1 Server Health Status
- **Endpoint:** `GET /health`
- **Auth Required:** No
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "timestamp": "2026-10-30T10:30:00.000Z"
}
```
