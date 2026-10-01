# API Endpoints Documentation

This document provides a comprehensive list of all API endpoints referenced in `server.js`, including sample payloads and responses.

Base URL: `https://priest-service.onrender.com`

---

## 1. Hero Banners API
**Base Path:** `/api/hero-banners`

### 1.1 Get All Active Hero Banners
- **Endpoint:** `/api/hero-banners`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
      "createdAt": "2023-10-01T12:00:00Z",
      "updatedAt": "2023-10-01T12:00:00Z"
    }
  ]
}
```

### 1.2 Get Hero Banner by ID
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
    "displayOrder": 1
  }
}
```

### 1.3 Create Hero Banner
- **Endpoint:** `/api/hero-banners`
- **Method:** `POST`
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
- **Response:**
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
    "displayOrder": 1
  }
}
```

### 1.4 Update Hero Banner
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `PUT`
- **Payload:**
```json
{
  "title": "Updated Ganesh Chaturthi Special",
  "displayOrder": 2
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Hero banner updated successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c1",
    "title": "Updated Ganesh Chaturthi Special",
    "displayOrder": 2
  }
}
```

### 1.5 Delete Hero Banner
- **Endpoint:** `/api/hero-banners/:id`
- **Method:** `DELETE`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "message": "Hero banner deleted successfully"
}
```

---

## 2. Pujas API
**Base Path:** `/api/pujas`

### 2.1 Get All Pujas
- **Endpoint:** `/api/pujas`
- **Method:** `GET`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ecb8b392d700153f93c2",
      "title": "Ganesh Puja",
      "description": "Removes obstacles.",
      "price": 1000,
      "imageUrl": "ganesh-puja.jpg",
      "status": "active"
    }
  ]
}
```

### 2.2 Create Puja
- **Endpoint:** `/api/pujas`
- **Method:** `POST`
- **Payload:**
```json
{
  "title": "Ganesh Puja",
  "description": "Removes obstacles.",
  "price": 1000,
  "imageUrl": "ganesh-puja.jpg",
  "status": "active"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Puja created successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "title": "Ganesh Puja",
    "description": "Removes obstacles.",
    "price": 1000
  }
}
```

### 2.3 Get Puja by ID
- **Endpoint:** `/api/pujas/:id`
- **Method:** `GET`
- **Payload:** None
- **Response:** Similar to Get All, but a single object.

### 2.4 Update Puja
- **Endpoint:** `/api/pujas/:id`
- **Method:** `PUT`
- **Payload:**
```json
{
  "price": 1200
}
```
- **Response:** Similar to Create response.

### 2.5 Delete Puja
- **Endpoint:** `/api/pujas/:id`
- **Method:** `DELETE`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "message": "Puja deleted successfully"
}
```

---

## 3. Homas API
**Base Path:** `/api/homas`

### 3.1 Get All Homas
- **Endpoint:** `/api/homas`
- **Method:** `GET`
- **Payload:** None
- **Response:** Similar to Pujas list.

### 3.2 Create Homa
- **Endpoint:** `/api/homas`
- **Method:** `POST`
- **Payload:**
```json
{
  "title": "Lakshmi Homa",
  "description": "For wealth and prosperity.",
  "price": 2500,
  "imageUrl": "lakshmi-homa.jpg",
  "status": "active"
}
```
- **Response:** Returns created Homa object.

### 3.3 Get Homa by ID
- **Endpoint:** `/api/homas/:id`
- **Method:** `GET`

### 3.4 Update Homa
- **Endpoint:** `/api/homas/:id`
- **Method:** `PUT`

### 3.5 Delete Homa
- **Endpoint:** `/api/homas/:id`
- **Method:** `DELETE`

---

## 4. OTP API
**Base Path:** `/api/otp`

### 4.1 Send OTP
- **Endpoint:** `/api/otp/sendOtp`
- **Method:** `POST`
- **Payload:**
```json
{
  "phone": "+919360270984"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 4.2 Verify OTP
- **Endpoint:** `/api/otp/verifyOtp`
- **Method:** `POST`
- **Payload:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "jwt-token-here"
}
```

---

## 5. Orders API
**Base Path:** `/api/orders`

### 5.1 Preview Order
- **Endpoint:** `/api/orders/preview`
- **Method:** `POST`
- **Payload:**
```json
{
  "cartItems": [
    {
      "itemId": "60d5ecb8b392d700153f93c2",
      "quantity": 1,
      "type": "puja"
    }
  ]
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "subTotal": 1000,
    "tax": 180,
    "total": 1180
  }
}
```

---

## 6. Pooja Details API
**Base Path:** `/api/pooja-details`

### 6.1 Get Pooja by ID
- **Endpoint:** `/api/pooja-details/:poojaId`
- **Method:** `GET`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "title": "Detailed Pooja View",
    "rituals": ["Sankalpam", "Aarti"]
  }
}
```

---

## 7. Wishlist API
**Base Path:** `/api/wishlist`

### 7.1 Update Wishlist
- **Endpoint:** `/api/wishlist/updateWishlist`
- **Method:** `POST`
- **Payload:**
```json
{
  "userId": "60d5ecb8b392d700153f93c3",
  "itemId": "60d5ecb8b392d700153f93c2",
  "action": "add" 
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Wishlist updated successfully",
  "data": {
    "items": ["60d5ecb8b392d700153f93c2"]
  }
}
```

### 7.2 Get Wishlist
- **Endpoint:** `/api/wishlist/:userId`
- **Method:** `GET`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "60d5ecb8b392d700153f93c2",
        "title": "Ganesh Puja"
      }
    ]
  }
}
```

---

## 8. Users API
**Base Path:** `/api/users`

### 8.1 Get Profile (by ID)
- **Endpoint:** `/api/users/profile/:userId`
- **Method:** `GET`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153f93c3",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

### 8.2 Get Profile (Self)
- **Endpoint:** `/api/users/profile`
- **Method:** `GET`
- **Payload:** None (Uses Auth Token)
- **Response:** Returns the authenticated user's profile.

### 8.3 Update Profile
- **Endpoint:** `/api/users/updateProfile`
- **Method:** `PUT`
- **Payload:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
}
```

---

## 9. Customer Queries API
**Base Path:** `/api/customer-queries`

### 9.1 Create Customer Query
- **Endpoint:** `/api/customer-queries`
- **Method:** `POST`
- **Payload:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "message": "I want to know more about the Lakshmi Homa."
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Query submitted successfully"
}
```

---

## 10. Payments API
**Base Path:** `/api/payments`

### 10.1 Create Payment Order
- **Endpoint:** `/api/payments/create-order`
- **Method:** `POST`
- **Payload:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt_order_74394"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_IluGWxBm9U8zJ8",
    "entity": "order",
    "amount": 100000, 
    "currency": "INR",
    "receipt": "receipt_order_74394",
    "status": "created"
  }
}
```

### 10.2 Verify Payment
- **Endpoint:** `/api/payments/verify`
- **Method:** `POST`
- **Payload:**
```json
{
  "razorpay_order_id": "order_IluGWxBm9U8zJ8",
  "razorpay_payment_id": "pay_IluGWxBm9U8zJ8",
  "razorpay_signature": "signature_hash_here"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 10.3 Webhook Response
- **Endpoint:** `/api/payments/webhook-response`
- **Method:** `POST`
- **Payload:**
```json
{
  "razorpayres": {
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_IluGWxBm9U8zJ8",
          "amount": 100000,
          "status": "captured"
        }
      }
    }
  }
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Razorpay webhook response received",
  "data": {
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_IluGWxBm9U8zJ8",
          "amount": 100000,
          "status": "captured"
        }
      }
    }
  }
}
```
