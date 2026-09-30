# Priest Service API Endpoints

Base URL: `http://localhost:5000`

---

## 📱 1. OTP Authentication (`/api/otp`)

### Send OTP
Generates and sends a 6-digit OTP to the user's mobile number.

* **Method:** `POST`
* **URL:** `/api/otp/sendOtp`
* **Body:**
```json
{
  "mobileNumber": "9876543210"
}
```

### Verify OTP 
Verifies the OTP. If the user doesn't exist, it creates a new user profile.

* **Method:** `POST`
* **URL:** `/api/otp/verifyOtp`
* **Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

---

## 👤 2. User Profile (`/api/users`)

### Update Profile
Updates the user's name and email address.

* **Method:** `PUT`
* **URL:** `/api/users/updateProfile`
* **Body:**
```json
{
  "userId": "65b2a2b7f3a8c90012345678",
  "name": "Jagathratchagan",
  "email": "jagath@example.com"
}
```

---

## ❤️ 3. Wishlist (`/api/wishlist`)

### Add / Remove from Wishlist
Toggles the wishlist state. If the service is already in the wishlist, it removes it. If it is not, it adds it.

* **Method:** `POST`
* **URL:** `/api/wishlist/updateWishlist`
* **Body:**
```json
{
  "userId": "65b2a2b7f3a8c90012345678",
  "serviceId": "6abb8542c534e0def1143114"
}
```

### Get User's Wishlist
Fetches all wishlisted Pujas and Homas for a specific user.

* **Method:** `GET`
* **URL:** `/api/wishlist/:userId`
* *(No body required. Replace `:userId` with actual user ID, e.g. `/api/wishlist/65b2a2b7f3a8c90012345678`)*

---

## 🛒 4. Orders & Checkout (`/api/orders`)

### Preview Order / Calculate Price
Calculates the total payable amount including extra participants, convenience fee, pandit fee, etc.

* **Method:** `POST`
* **URL:** `/api/orders/preview`

**Body (For Pooja):**
```json
{
  "poojaId": "6abb8542c534e0def1143114", 
  "whatsappNumber": "9876543210",
  "participants": [
    { "name": "Jagathratchagan" },
    { "name": "Participant Two" }
  ],
  "gotra": "Kashyapa",
  "doesNotKnowGotra": false,
  "wish": "For family well-being",
  "bookingDate": "2026-10-06T00:00:00.000Z"
}
```

**Body (For Homa):**
```json
{
  "homaId": "6abcd542c534e0def1149999", 
  "whatsappNumber": "9876543210",
  "participants": [
    { "name": "Jagathratchagan" }
  ],
  "bookingDate": "2026-10-06T00:00:00.000Z"
}
```

---

## 🙏 5. Pooja Details (`/api/pooja-details`)

### Get Pooja Details by ID
* **Method:** `GET`
* **URL:** `/api/pooja-details/:poojaId`
* *(No body required. Replace `:poojaId` with actual pooja ID)*

---

## 🛕 6. Pujas & Homas Catalog (`/api/pujas` & `/api/homas`)
*(Assuming standard GET endpoints exist in these route files)*

### Get All Pujas
* **Method:** `GET`
* **URL:** `/api/pujas`

### Get All Homas
* **Method:** `GET`
* **URL:** `/api/homas`
