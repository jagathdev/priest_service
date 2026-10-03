# API Endpoints Documentation

This document provides a comprehensive list of all API endpoints referenced in `server.js`, including full sample payloads and responses.

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
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
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
    "displayOrder": 1,
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
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
    "displayOrder": 1,
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
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
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-05T12:00:00.000Z"
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
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
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
- **Response:**
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
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
  }
}
```

### 2.3 Get Puja by ID
- **Endpoint:** `/api/pujas/:id`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
  }
}
```

### 2.4 Update Puja
- **Endpoint:** `/api/pujas/:id`
- **Method:** `PUT`
- **Payload:**
```json
{
  "price": 1200,
  "basePrice": 1200
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Puja updated successfully",
  "data": {
    "_id": "60d5ecb8b392d700153f93c2",
    "name": "Ganesh Puja",
    "title": "Ganesh Puja",
    "description": "Removes obstacles and brings prosperity.",
    "about": "Detailed about section for Ganesh Puja...",
    "benefits": ["Removes Obstacles", "Brings Success"],
    "process": ["Ganapati Sthapana", "Sankalpa", "Aarti"],
    "deity": "Lord Ganesha",
    "price": 1200,
    "basePrice": 1200,
    "extraParticipantPrice": 250,
    "maxParticipants": 5,
    "imageUrl": "https://example.com/ganesh-puja.jpg",
    "image": "https://example.com/ganesh-puja.jpg",
    "status": "active",
    "isActive": true,
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-05T12:00:00.000Z"
  }
}
```

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
- **Response:**
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
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    }
  ]
}
```

### 3.2 Create Homa
- **Endpoint:** `/api/homas`
- **Method:** `POST`
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
- **Response:**
```json
{
  "success": true,
  "message": "Homa created successfully",
  "data": {
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
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
  }
}
```

### 3.3 Get Homa by ID
- **Endpoint:** `/api/homas/:id`
- **Method:** `GET`
- **Payload:** None
- **Response:** 
*(Identical full homa object payload as returned in Create Homa)*

### 3.4 Update Homa
- **Endpoint:** `/api/homas/:id`
- **Method:** `PUT`
- **Payload:**
```json
{
  "price": 2700,
  "basePrice": 2700
}
```
- **Response:** 
*(Identical full homa object payload with updated fields)*

### 3.5 Delete Homa
- **Endpoint:** `/api/homas/:id`
- **Method:** `DELETE`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "message": "Homa deleted successfully"
}
```

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
  "phone": "+919360270984",
  "otp": "123456"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6abd0358cd62648ac4fa1c4a",
    "mobileNumber": "+919360270984",
    "name": "Jagathratchagan"
  }
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
- **Response:**
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

### 5.2 Get User Orders
- **Endpoint:** `/api/orders/user/:userId`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
      "wish": "Prayers offered for family happiness, prosperity, and divine blessings.",
      "bookingDate": "2026-10-12T00:00:00.000Z",
      "pricing": {
        "basePrice": 2500,
        "extraParticipantCount": 0,
        "extraParticipantAmount": 0,
        "total": 2500,
        "convenienceFee": 0,
        "panditFee": 0,
        "recordingFee": 0,
        "currency": "INR"
      },
      "paymentDetails": {
        "transactionId": "pay_TjGKajdznC2zO8",
        "paymentMethod": "Razorpay",
        "paymentDate": "2026-09-25T01:59:08.972Z",
        "gatewayResponse": {
          "razorpayOrderId": "order_TjGKDZrwmLS1kA",
          "razorpayPaymentId": "pay_TjGKajdznC2zO8",
          "razorpaySignature": "457b1f686661120c09ba6b0db4794ce1a98ad8e3b8c1fa5e4d90bbda793e6983"
        }
      },
      "paymentStatus": "paid",
      "orderStatus": "paid",
      "createdAt": "2026-09-25T01:59:08.972Z",
      "updatedAt": "2026-09-25T01:59:08.972Z"
    }
  ]
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
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
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
  "userId": "6abd0358cd62648ac4fa1c4a",
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
    "user": "6abd0358cd62648ac4fa1c4a",
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
        "name": "Ganesh Puja",
        "price": 1000,
        "imageUrl": "https://example.com/ganesh-puja.jpg"
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
    "_id": "6abd0358cd62648ac4fa1c4a",
    "name": "Jagathratchagan",
    "email": "jagath@example.com",
    "mobileNumber": "9360270984",
    "gender": "Male",
    "dob": "1990-01-01",
    "placeOfBirth": "Chennai",
    "occupation": "Software Engineer",
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
        "isDefault": true,
        "_id": "6ac12345cd62648ac4fa1c5b"
      }
    ],
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-05T12:00:00.000Z"
  }
}
```

### 8.2 Get Profile (Self)
- **Endpoint:** `/api/users/profile`
- **Method:** `GET`
- **Payload:** None (Uses Auth Token header `Authorization: Bearer <token>`)
- **Response:** *(Identical full user object payload as returned in Get Profile by ID)*

### 8.3 Update Profile
- **Endpoint:** `/api/users/updateProfile`
- **Method:** `PUT`
- **Payload:**
```json
{
  "userId": "6abd0358cd62648ac4fa1c4a",
  "name": "Jagathratchagan Updated",
  "email": "jagath.updated@example.com",
  "gender": "Male",
  "dob": "1990-01-01",
  "placeOfBirth": "Chennai",
  "occupation": "Senior Software Engineer"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "6abd0358cd62648ac4fa1c4a",
    "name": "Jagathratchagan Updated",
    "email": "jagath.updated@example.com",
    "mobileNumber": "9360270984",
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
        "isDefault": true,
        "_id": "6ac12345cd62648ac4fa1c5b"
      }
    ],
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-06T12:00:00.000Z"
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
  "mobileNumber": "9876543210",
  "subject": "Inquiry regarding Lakshmi Homa",
  "message": "I want to know more about the Lakshmi Homa availability for next month."
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Query submitted successfully",
  "data": {
    "_id": "6abd0999cd62648ac4fa1c9f",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "mobileNumber": "9876543210",
    "subject": "Inquiry regarding Lakshmi Homa",
    "message": "I want to know more about the Lakshmi Homa availability for next month.",
    "status": "Open",
    "createdAt": "2023-10-10T12:00:00.000Z",
    "updatedAt": "2023-10-10T12:00:00.000Z"
  }
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
  "amount": 2500,
  "currency": "INR",
  "receipt": "receipt_order_200627",
  "notes": {
    "customerId": "6abd0358cd62648ac4fa1c4a",
    "serviceName": "Rameshwaram Tharpanam"
  }
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_TjGKDZrwmLS1kA",
    "entity": "order",
    "amount": 250000, 
    "amount_paid": 0,
    "amount_due": 250000,
    "currency": "INR",
    "receipt": "receipt_order_200627",
    "status": "created",
    "attempts": 0,
    "notes": {
      "customerId": "6abd0358cd62648ac4fa1c4a",
      "serviceName": "Rameshwaram Tharpanam"
    },
    "created_at": 1696500000
  }
}
```

### 10.2 Verify Payment
- **Endpoint:** `/api/payments/verify`
- **Method:** `POST`
- **Payload:**
```json
{
  "razorpay_order_id": "order_TjGKDZrwmLS1kA",
  "razorpay_payment_id": "pay_TjGKajdznC2zO8",
  "razorpay_signature": "457b1f686661120c09ba6b0db4794ce1a98ad8e3b8c1fa5e4d90bbda793e6983"
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
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_TjGKajdznC2zO8",
        "entity": "payment",
        "amount": 250000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_TjGKDZrwmLS1kA",
        "invoice_id": null,
        "international": false,
        "method": "card",
        "amount_refunded": 0,
        "refund_status": null,
        "captured": true,
        "description": "Payment for Priest Service",
        "card_id": "card_TjGKhL0Qj2N51l",
        "bank": null,
        "wallet": null,
        "vpa": null,
        "email": "jagath@example.com",
        "contact": "+919360270984",
        "notes": {
          "customerId": "6abd0358cd62648ac4fa1c4a",
          "serviceName": "Rameshwaram Tharpanam"
        },
        "fee": 5000,
        "tax": 900,
        "error_code": null,
        "error_description": null,
        "error_source": null,
        "error_step": null,
        "error_reason": null,
        "created_at": 1696500050
      }
    }
  },
  "created_at": 1696500060,
  "account_id": "acc_Gj8c67jJ2KopR9"
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
          "id": "pay_TjGKajdznC2zO8",
          "amount": 250000,
          "status": "captured"
        }
      }
    }
  }
}
```

---

## 11. Admin API
**Base Path:** `/api/admin`

### 11.1 Admin Login
- **Endpoint:** `/api/admin/login`
- **Method:** `POST`
- **Payload:**
```json
{
  "email": "admin@astroved.com",
  "password": "password123"
}
```
- **Response:**
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

### 11.2 Get Admin Dashboard Stats
- **Endpoint:** `/api/admin/stats`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
        "createdAt": "2026-09-25T01:59:08.972Z"
      }
    ]
  }
}
```

### 11.3 Get Admin Orders
- **Endpoint:** `/api/admin/orders`
- **Method:** `GET`
- **Payload:** None
- **Response:**
```json
{
  "success": true,
  "data": [
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
      "createdAt": "2026-09-25T01:59:08.972Z"
    }
  ]
}
```

### 11.4 Get Admin Payments Analytics
- **Endpoint:** `/api/admin/payments`
- **Method:** `GET`
- **Payload:** None
- **Response:**
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
