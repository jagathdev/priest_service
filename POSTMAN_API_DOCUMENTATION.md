# Priest Services — Complete Postman API Collection (100% Endpoints)

Complete, production-tested REST API specification for **every single endpoint** in the Priest Services backend, pre-filled with **real database records** (Devotee Mobile: `9360270984`, User ID: `6af41316aef3f8bdce0110c3`, Admin: `admin@astroved.com`).

---

## ⚙️ Postman Global Environment Variables

Set these in your Postman environment:

| Variable | Value | Description |
|---|---|---|
| `baseUrl` | `http://localhost:8564` | Backend Server Base URL (`https://priestservices.astroved.com` for prod) |
| `userMobile` | `9360270984` | Real Devotee Login Mobile Number |
| `userId` | `6af41316aef3f8bdce0110c3` | Real Devotee User ID (Jagath) |
| `pujaId` | `6abd0334cd62648ac4fa1c49` | Real Puja ID (Shani Dosha Nivarana Puja) |
| `homaId` | `6abd0358cd62648ac4fa1c4a` | Real Homa ID |
| `orderId` | `6af423826832cd32c168a527` | Real Order ID (`PS-2026-000001`) |
| `orderNumber` | `PS-2026-000001` | Real Order Number |
| `promoCodeId` | `6af56c6db5be7965191b1985` | Real Promo Code ID (`PUJA10`) |
| `bannerId` | `6ac4b890fa219018ab390182` | Real Hero Banner ID |
| `recipientId` | `6af41c8290ba8231cd890123` | Real Notification Recipient ID |
| `queryId` | `6af5710fa982bd189a018234` | Real Customer Query ID |
| `feedbackId` | `6af5790acb82194ad8109823` | Real Feedback ID |

---

# 📑 TABLE OF CONTENTS (ALL ENDPOINTS)

1. [System & Health](#1-system--health)
2. [Devotee Authentication (OTP)](#2-devotee-authentication-otp)
3. [Devotee User Profile](#3-devotee-user-profile)
4. [Puja Catalog](#4-puja-catalog)
5. [Homa Catalog](#5-homa-catalog)
6. [Hero Banners](#6-hero-banners)
7. [Orders & Bookings (Client)](#7-orders--bookings-client)
8. [Payments & Razorpay](#8-payments--razorpay)
9. [Promo Codes (Client & Admin)](#9-promo-codes-client--admin)
10. [Website Visitor & UTM Analytics](#10-website-visitor--utm-analytics)
11. [Customer Support Queries (Client & Admin)](#11-customer-support-queries)
12. [Devotee Feedback & Reviews](#12-devotee-feedback--reviews)
13. [Devotee Wishlist](#13-devotee-wishlist)
14. [WhatsApp Opt-In / Opt-Out](#14-whatsapp-notifications)
15. [Admin Authentication](#15-admin-authentication)
16. [Admin Dashboard KPI Stats](#16-admin-dashboard-kpi-stats)
17. [Admin Orders Management](#17-admin-orders-management)
18. [Admin Devotee Directory & Trash](#18-admin-devotee-directory--trash)
19. [Admin Pre-Order Leads](#19-admin-pre-order-leads)
20. [Admin Service Dispatch & Excel Export](#20-admin-service-dispatch--excel-export)
21. [Admin Notification Email Recipients](#21-admin-notification-email-recipients)
22. [Media Library & File Uploads](#22-media-library--file-uploads)

---

## 1. System & Health

### 1.1 Health Check
- **Method:** `GET`
- **URL:** `{{baseUrl}}/health`
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "timestamp": "2026-11-14T09:45:00.000Z"
}
```

---

## 2. Devotee Authentication (OTP)

### 2.1 Send Mobile Login OTP
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/otp/sendOtp`
- **Body:**
```json
{
  "mobileNumber": "9360270984"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "OTP sent successfully to 9360270984"
}
```

### 2.2 Verify Mobile Login OTP
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/otp/verifyOtp`
- **Body:**
```json
{
  "mobileNumber": "9360270984",
  "otp": "123456"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "is_user": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "is_user": true,
    "user": {
      "id": "6af41316aef3f8bdce0110c3",
      "mobileNumber": "919360270984",
      "whatsappNumber": "919360270984",
      "name": "Jagath",
      "email": "jagath@astroved.com",
      "isVerified": true,
      "walletBalance": 0,
      "addresses": []
    }
  }
}
```

---

## 3. Devotee User Profile

### 3.1 Get Devotee Profile By User ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/users/profile/{{userId}}`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "_id": "6af41316aef3f8bdce0110c3",
    "mobileNumber": "919360270984",
    "whatsappNumber": "919360270984",
    "name": "Jagath",
    "email": "jagath@astroved.com",
    "isVerified": true,
    "walletBalance": 0,
    "addresses": [],
    "role": "user"
  }
}
```

### 3.2 Get Current Authenticated Profile
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/users/profile`
- **Response (`200 OK`):** Returns profile matching active cookie session.

### 3.3 Update Devotee Profile
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/users/updateProfile`
- **Body:**
```json
{
  "userId": "6af41316aef3f8bdce0110c3",
  "name": "Jagath Dev",
  "email": "jagath@astroved.com",
  "whatsappNumber": "9360270984"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "6af41316aef3f8bdce0110c3",
    "name": "Jagath Dev",
    "email": "jagath@astroved.com",
    "mobileNumber": "919360270984"
  }
}
```

### 3.4 Devotee Logout
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/users/logout`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 4. Puja Catalog

### 4.1 Get All Active Pujas
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/pujas`
- **Response (`200 OK`):** Array of active Puja documents.

### 4.2 Get Puja By ID or Slug
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/pujas/shani-puja` (or `{{baseUrl}}/api/pujas/{{pujaId}}`)
- **Response (`200 OK`):** Single Puja document with packages and offerings.

### 4.3 Create Puja (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/pujas`
- **Body:**
```json
{
  "title": "Lord Ganesha Obstacle Removal Puja",
  "slug": "ganesha-puja",
  "status": "active",
  "location": "Tamil Nadu",
  "templeVenue": "Vinayagar Temple",
  "deity": "Lord Ganesha",
  "packages": [
    { "name": "Individual Puja", "priceINR": 1500 }
  ]
}
```

### 4.4 Update Puja (Admin)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/pujas/{{pujaId}}`
- **Body:** `{ "title": "Updated Shani Dosha Nivarana Puja" }`

### 4.5 Delete Puja (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/pujas/{{pujaId}}`

---

## 5. Homa Catalog

### 5.1 Get All Active Homas
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/homas`

### 5.2 Get Homa By ID or Slug
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/homas/{{homaId}}`

### 5.3 Create Homa (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/homas`
- **Body:** `{ "title": "Maha Sudarshana Homa", "slug": "sudarshana-homa", "status": "active" }`

### 5.4 Update Homa (Admin)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/homas/{{homaId}}`

### 5.5 Delete Homa (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/homas/{{homaId}}`

---

## 6. Hero Banners

### 6.1 Get Active Home Banners
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/hero-banners`

### 6.2 Get Hero Banner By ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/hero-banners/{{bannerId}}`

### 6.3 Create Hero Banner (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/hero-banners`
- **Body:**
```json
{
  "title": "Navagraha Shanti Special",
  "subtitle": "Seek Divine Planetary Blessings",
  "imageUrl": "/api/images/banner1.jpg",
  "ctaLink": "/puja/shani-puja",
  "isActive": true
}
```

### 6.4 Update Hero Banner (Admin)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/hero-banners/{{bannerId}}`

### 6.5 Delete Hero Banner (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/hero-banners/{{bannerId}}`

---

## 7. Orders & Bookings (Client)

### 7.1 Check Order Status
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/orders/status?orderNumber={{orderNumber}}`
- **Response (`200 OK`):** Order status summary.

### 7.2 Preview Order Breakdown
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/orders/preview`
- **Body:**
```json
{
  "serviceId": "6abd0334cd62648ac4fa1c49",
  "packageId": "pkg-1",
  "offerings": [],
  "promoCode": "PUJA10"
}
```

### 7.3 Get Devotee Past Orders
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/orders/user/{{userId}}`
- **Response (`200 OK`):** Array of orders booked by this devotee.

---

## 8. Payments & Razorpay

### 8.1 Create Razorpay Order & Pre-Order Lead
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/payments/create-order`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "customerId": "6af41316aef3f8bdce0110c3",
  "currencyCode": "INR",
  "shoppingCartId": 0,
  "serviceId": "6abd0334cd62648ac4fa1c49",
  "packageId": "pkg-1",
  "promoCode": "PUJA10",
  "contactId": 1367254,
  "localeId": 1,
  "trackingCode1": "",
  "trackingCode2": "",
  "shippingpreferred": false,
  "contactDetail": {
    "CustomerId": "6af41316aef3f8bdce0110c3",
    "FirstName": "Jagath",
    "LastName": "Dev",
    "ShopName": "AstroVed",
    "Street": "123 Main St",
    "City": "Chennai",
    "State": "Tamil Nadu",
    "Country": "India",
    "Pincode": "600001",
    "Phone": "9360270984"
  },
  "totalamount": 3151,
  "orderDetails": {
    "pooja": "Shani Dosha Nivarana Puja",
    "serviceId": "6abd0334cd62648ac4fa1c49",
    "serviceType": "Pooja",
    "customer": "6af41316aef3f8bdce0110c3",
    "customerName": "Jagath Dev",
    "itemName": "Shani Dosha Nivarana Puja",
    "mobileNumber": "9360270984",
    "whatsappNumber": "919360270984",
    "participants": [
      {
        "name": "Jagath",
        "gotra": "siva gotra",
        "doesNotKnowGotra": false
      }
    ],
    "gotra": "siva gotra",
    "doesNotKnowGotra": false,
    "wish": "Family peace and well-being",
    "promoCode": "PUJA10",
    "promoCodeId": "6af56c6db5be7965191b1985",
    "packageId": "pkg-1",
    "offerings": [
      {
        "name": "Maha Bhog Prasadam",
        "priceINR": 751,
        "description": "Grand offering of sweets and food."
      }
    ],
    "originalAmount": 3251,
    "discountAmount": 100,
    "pricing": {
      "basePrice": 2500,
      "extraParticipantCount": 0,
      "extraParticipantAmount": 0,
      "offeringsAmount": 751,
      "total": 3151
    },
    "utmSource": "Facebook",
    "utmMedium": "traffic_ad",
    "utmCampaign": "PS_Navagraha_Campaign"
  }
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_TzenK9pLmQrStU",
    "amount": 315100,
    "currency": "INR",
    "keyId": "rzp_test_lHaqA31HDZDSHE"
  }
}
```

### 8.2 Verify Razorpay Payment Signature
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/payments/verify`
- **Body:**
```json
{
  "razorpayOrderId": "order_TzenK9pLmQrStU",
  "razorpayPaymentId": "pay_TzenXYZ1234567",
  "razorpaySignature": "3f82a1708d748fba...",
  "orderDetails": { ... }
}
```

### 8.3 Razorpay Webhook Endpoint
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/payments/getRazorpayWebhook`
- **Headers:** `X-Razorpay-Signature: ...`

---

## 9. Promo Codes (Client & Admin)

### 9.1 Apply & Validate Promo Code (Client)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/promos/apply`
- **Body:**
```json
{
  "code": "PUJA10",
  "orderAmount": 2500,
  "serviceId": "6abd0334cd62648ac4fa1c49",
  "userId": "6af41316aef3f8bdce0110c3"
}
```

### 9.2 Get All Promo Codes (Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/promos`

### 9.3 Get Single Promo Code By ID (Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/promos/{{promoCodeId}}`

### 9.4 Get Promo Code Usage Stats (Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/promos/{{promoCodeId}}/usage`

### 9.5 Create Promo Code (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/promos`
- **Body:**
```json
{
  "code": "FESTIVE20",
  "description": "20% Discount Offer",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "maxDiscount": 500,
  "minimumOrderAmount": 1000,
  "startDate": "2026-11-14T00:00:00.000Z",
  "endDate": "2026-11-30T23:59:59.000Z",
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "applicableServices": "ALL",
  "isActive": true
}
```

### 9.6 Update Promo Code (Admin)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/promos/{{promoCodeId}}`

### 9.7 Delete Promo Code (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/promos/{{promoCodeId}}`

---

## 10. Website Visitor & UTM Analytics

### 10.1 Track Visitor Session & UTM Landing (Client)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/analytics/track-visitor`
- **Body:**
```json
{
  "sessionId": "vs_a8f9b2c3d_179464",
  "utmSource": "Instagram",
  "utmMedium": "story_ad",
  "utmCampaign": "PS_Deepavali_Puja",
  "utmTerm": "shani puja",
  "utmContent": "carousel_v1",
  "promo": "FESTIVE10",
  "landingPage": "/puja/shani-puja",
  "referrer": "https://l.instagram.com/"
}
```

### 10.2 Get Visitor Analytics Breakdown (Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/analytics/visitor-stats?startDate=2026-11-01&endDate=2026-11-14`

---

## 11. Customer Support Queries

### 11.1 Submit Devotee Inquiry (Client)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/customerQueries`
- **Body:**
```json
{
  "name": "Jagath",
  "email": "jagath@astroved.com",
  "mobileNumber": "9360270984",
  "bookingId": "PS-2026-000001",
  "subject": "Livestream Query",
  "message": "When will the Puja video link be shared?"
}
```

### 11.2 Get All Inquiries (Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/customer-queries`

### 11.3 Update Inquiry Status / Add Notes (Admin)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/admin/customer-queries/{{queryId}}`
- **Body:** `{ "status": "resolved", "adminNotes": "Devotee contacted via WhatsApp" }`

### 11.4 Delete Single Inquiry (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/admin/customer-queries/{{queryId}}`

### 11.5 Bulk Delete Inquiries (Admin)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/customer-queries/bulk-delete`
- **Body:** `{ "queryIds": ["6af5710fa982bd189a018234"] }`

---

## 12. Devotee Feedback & Reviews

### 12.1 Submit Order Feedback (Client)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/orders/{{orderId}}/feedback`
- **Body:**
```json
{
  "rating": 5,
  "review": "Blessed ritual experience. Experienced priest."
}
```

### 12.2 Get Feedback For Order (Client/Admin)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/orders/{{orderId}}/feedback`

### 12.3 Delete Order Feedback (Admin)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/orders/{{orderId}}/feedback/{{feedbackId}}`

---

## 13. Devotee Wishlist

### 13.1 Update Devotee Wishlist
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/wishlist/updateWishlist`
- **Body:**
```json
{
  "userId": "6af41316aef3f8bdce0110c3",
  "serviceId": "6abd0334cd62648ac4fa1c49"
}
```

### 13.2 Get Devotee Wishlist
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/wishlist/{{userId}}`

---

## 14. WhatsApp Notifications

### 14.1 WhatsApp Opt-In Consent
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/whatsapp/opt-in`
- **Body:** `{ "mobileNumber": "9360270984" }`

### 14.2 WhatsApp Opt-Out
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/whatsapp/opt-out`
- **Body:** `{ "mobileNumber": "9360270984" }`

---

## 15. Admin Authentication

### 15.1 Admin Login
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/login`
- **Body:**
```json
{
  "email": "admin@astroved.com",
  "password": "your_password"
}
```
- **Response (`200 OK`):** Sets `adminToken` in HttpOnly cookies.

### 15.2 Admin Logout
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/logout`
- **Response (`200 OK`):** Clears `adminToken` cookie.

---

## 16. Admin Dashboard KPI Stats

### 16.1 Get Stats & Counters
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/stats`

---

## 17. Admin Orders Management

### 17.1 Get Orders List
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/orders?page=1&limit=10&status=All&service=All`

### 17.2 Get Order By ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/orders/{{orderId}}`

### 17.3 Update Order (Livestream & Scheduled Date)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/admin/orders/{{orderId}}`
- **Body:**
```json
{
  "orderStatus": "scheduled",
  "scheduledDate": "2026-11-20T04:30:00.000Z",
  "videoLink": "https://www.youtube.com/watch?v=9gW9gcIcmF0"
}
```

### 17.4 Bulk Schedule Orders
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/orders/bulk-schedule`
- **Body:**
```json
{
  "orderIds": ["6af423826832cd32c168a527"],
  "scheduledDate": "2026-11-20T04:30:00.000Z"
}
```

### 17.5 Bulk Update Orders Status
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/orders/bulk-status`
- **Body:**
```json
{
  "orderIds": ["6af423826832cd32c168a527"],
  "status": "completed"
}
```

### 17.6 Resend Order Confirmation Email
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/orders/{{orderId}}/resend-email`

### 17.7 Get Admin Payments Audit List
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/payments`

---

## 18. Admin Devotee Directory & Trash

### 18.1 Get Devotees List (Active or Trash)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/users?page=1&limit=10&search=&sort=latest&trash=false`

### 18.2 Update Devotee Details
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/admin/users/{{userId}}`
- **Body:**
```json
{
  "name": "Jagath Dev",
  "email": "jagath@astroved.com",
  "mobileNumber": "919360270984",
  "whatsappNumber": "919360270984",
  "isVerified": true
}
```

### 18.3 Move Devotee to Trash (Soft Delete)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/admin/users/{{userId}}`

### 18.4 Restore Devotee From Trash
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/admin/users/{{userId}}/restore`

### 18.5 Permanently Delete Devotee
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/admin/users/{{userId}}/permanent`

### 18.6 Bulk Move Devotees to Trash
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/users/bulk-delete`
- **Body:** `{ "userIds": ["6af41316aef3f8bdce0110c3"] }`

### 18.7 Bulk Restore Devotees
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/users/bulk-restore`
- **Body:** `{ "userIds": ["6af41316aef3f8bdce0110c3"] }`

### 18.8 Bulk Permanently Delete Devotees
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/users/bulk-permanent-delete`
- **Body:** `{ "userIds": ["6af41316aef3f8bdce0110c3"] }`

---

## 19. Admin Pre-Order Leads

### 19.1 Get Abandoned / Pre-Order Leads
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/pre-orders?page=1&limit=10`

### 19.2 Delete Pre-Order Lead
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/admin/pre-orders/:id`

### 19.3 Bulk Delete Pre-Order Leads
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/pre-orders/bulk-delete`
- **Body:** `{ "leadIds": ["..."] }`

---

## 20. Admin Service Dispatch & Excel Export

### 20.1 Get Priest Service Dispatch Devotees
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/service-dispatch?status=confirmed`

### 20.2 Export Devotee Sankalp List (Excel)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/service-dispatch/export`
- **Response:** Binary Excel spreadsheet (`.xlsx`).

---

## 21. Admin Notification Email Recipients

### 21.1 Get Active Email Notification Recipients
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/admin/notifications/recipients`

### 21.2 Add Email Notification Recipient
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/notifications/recipients`
- **Body:**
```json
{
  "name": "Priest Operations",
  "email": "operations@astroved.com",
  "role": "Admin",
  "alertTypes": ["ORDERS", "CUSTOMER_QUERIES"],
  "isActive": true
}
```

### 21.3 Update Notification Recipient
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/admin/notifications/recipients/{{recipientId}}`
- **Body:** `{ "isActive": false }`

### 21.4 Delete Notification Recipient
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/admin/notifications/recipients/{{recipientId}}`

### 21.5 Send Test Notification Email
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/admin/notifications/test-mail`
- **Body:** `{ "email": "jagath@astroved.com" }`

---

## 22. Media Library & File Uploads

### 22.1 Get All Uploaded Media
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/upload`

### 22.2 Upload New Image
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/upload`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:** Key: `image` (Type: File)

### 22.3 Rename / Edit Image
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/upload/banner.png`
- **Body:** `{ "newName": "banner_v2.png" }`

### 22.4 Delete Image (Move to Trash)
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/upload/banner.png`

### 22.5 Restore Image
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/upload/banner.png/restore`

### 22.6 Permanently Delete Image
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/upload/banner.png/permanent`

### 22.7 Delete All Media
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/upload/all`
