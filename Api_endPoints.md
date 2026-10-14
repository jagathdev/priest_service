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
  "data": {
    "is_user": true,
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
- **Auth Required:** Optional (`Authorization: Bearer <user_token>` or provide `userId` directly in body)
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
- **Endpoint:** `/api/orders/user/:userId`
- **Method:** `GET`
- **Auth Required:** No
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
- **Auth Required:** No
- **Payload:**
```json
{
  "userId": "6abd0358cd62648ac4fa1c4a",
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
- **Endpoint:** `/api/wishlist/:userId`
- **Method:** `GET`
- **Auth Required:** No
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
- **Description:** Validates order details, calculates server-verified prices for package, extra participants, offerings, and promo codes, generates Razorpay order, and creates a pending `Order` record in MongoDB.
- **Payload:**
```json
{
  "customerId": "6abd0358cd62648ac4fa1c4a",
  "currencyCode": "INR",
  "shoppingCartId": 0,
  "serviceId": "6abd0362cd62648ac4fa1c4b",
  "packageId": "pkg-1",
  "promoCode": "FESTIVE50",
  "totalamount": 2153,
  "orderDetails": {
    "pooja": "Rameshwaram Tharpanam",
    "serviceId": "6abd0362cd62648ac4fa1c4b",
    "serviceType": "Pooja",
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
    "promoCodeId": "670985123456789abcdef012",
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
    "originalAmount": 2153,
    "discountAmount": 0,
    "pricing": {
      "basePrice": 1251,
      "extraParticipantCount": 1,
      "extraParticipantAmount": 300,
      "offeringsAmount": 602,
      "total": 2153
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
    "amount": 215300,
    "currency": "INR",
    "notes": {
      "uniqueId": "A1B2C3D4E5F67890"
    },
    "keyId": "rzp_test_xxxxxx"
  }
}
```

### 11.2 Verify Payment Signature & Finalize Order
- **Endpoint:** `/api/payments/verify`
- **Method:** `POST`
- **Auth Required:** No
- **Description:** Verifies HMAC-SHA256 signature from Razorpay checkout. Races safely with the webhook via `markOrderPaid`. Transitions pending order to `paid`/`confirmed` and sends WhatsApp confirmation.
- **Payload:**
```json
{
  "razorpayOrderId": "order_TjGKDZrwmLS1kA",
  "razorpayPaymentId": "pay_TjGKajdznC2zO8",
  "razorpaySignature": "457b1f686661120c09ba6b0db4794ce1a98ad8e3b8c1fa5e4d90bbda793e6983",
  "orderDetails": {
    "pooja": "Rameshwaram Tharpanam",
    "serviceId": "6abd0362cd62648ac4fa1c4b",
    "serviceType": "Pooja",
    "customer": "6abd0358cd62648ac4fa1c4a",
    "customerName": "Jagathratchagan",
    "whatsappNumber": "919360270984",
    "mobileNumber": "9360270984",
    "participants": [
      { "name": "Jagath" },
      { "name": "Friend" }
    ],
    "offerings": [
      { "name": "Vastra Daan", "priceINR": 501 },
      { "name": "Kumkum Archana", "priceINR": 101 }
    ],
    "pricing": {
      "basePrice": 1251,
      "extraParticipantCount": 1,
      "extraParticipantAmount": 300,
      "offeringsAmount": 602,
      "total": 2153
    }
  }
}
```
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "razorpayOrderId": "order_TjGKDZrwmLS1kA",
    "razorpayPaymentId": "pay_TjGKajdznC2zO8",
    "orderId": "6ac06417d6fcac10cf339e5c",
    "orderNumber": "PS-2026-000123"
  }
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
- **Description:** Production live webhook URL called by Razorpay servers on asynchronous payment events (`payment.captured`, `order.paid`, `payment.failed`). Uses raw-body HMAC SHA256 signature verification, idempotently logs into `WebhookEvent` and `Payment` models, finalizes orders via `markOrderPaid`, and triggers WhatsApp confirmation without risk of duplicate notifications.
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
        "amount": 215300,
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
  "message": "Webhook processed successfully",
  "event": "payment.captured"
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
- **Payload:**
```json
{
  "code": "FESTIVE50",
  "orderAmount": 2000,
  "serviceType": "pooja",
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
- **Auth Required:** No
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

### 13.2 Send WhatsApp Order Confirmation
- **Endpoint:** `/api/whatsapp/order-confirmation`
- **Method:** `POST`
- **Auth Required:** No
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
- **Auth Required:** No (Rate limited via `loginLimiter`)
- **Payload:**
```json
{
  "email": "admin@astroved.com",
  "password": "password123"
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
