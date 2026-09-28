# DivineAlign Project Overview

## Purpose

This project is a **Next.js-based spiritual services platform**. It appears to support:

- temples
- pujas
- chadhava offerings
- astrologers
- panchang
- consultation booking
- payments
- user authentication
- an admin dashboard for content management

---

## End-to-End Flow

1. **User visits the homepage**
   - Main landing page is in `src/app/page.tsx`
   - It likely shows featured services and navigation

2. **User browses services**
   - Public pages include:
     - temples
     - puja
     - chadhava
     - astrologers
     - library
     - store
     - panchang
     - astro tools

3. **User opens a detail page**
   - Dynamic routes are used for:
     - `src/app/puja/[slug]/page.tsx`
     - `src/app/chadhava/[slug]/page.tsx`
     - `src/app/astrologers/[id]/page.tsx`

4. **User logs in or signs up**
   - Authentication pages are in:
     - `src/app/auth/login/page.tsx`
     - `src/app/auth/signup/page.tsx`
     - `src/app/auth/forgot-password/page.tsx`

5. **User books a service**
   - Booking UI is likely handled by:
     - `src/components/booking/BookingForm.tsx`
     - `src/components/booking/PaymentSection.tsx`
   - Booking APIs are in:
     - `src/app/api/bookings/create/route.ts`
     - `src/app/api/bookings/me/route.ts`

6. **User checks profile or dashboard**
   - Relevant pages:
     - `src/app/profile/page.tsx`
     - `src/app/dashboard/page.tsx`

7. **Admin manages content**
   - Admin area is under:
     - `src/app/admin/`
   - Admin APIs are in:
     - `src/app/api/admin/*`

---

## Folder Structure Summary

### `public/`
Static assets such as SVG icons and images.

### `src/app/`
Main application routes using the App Router.

#### Public pages
- `page.tsx` → homepage
- `temples/page.tsx`
- `panchang/page.tsx`
- `store/page.tsx`
- `library/page.tsx`
- `astro-tools/page.tsx`
- `consultation/page.tsx`
- `booking/page.tsx`
- `payment/page.tsx`
- `profile/page.tsx`
- `dashboard/page.tsx`

#### Service detail pages
- `chadhava/[slug]/page.tsx`
- `puja/[slug]/page.tsx`
- `astrologers/[id]/page.tsx`

#### Authentication pages
- `auth/login/page.tsx`
- `auth/signup/page.tsx`
- `auth/forgot-password/page.tsx`

#### Admin pages
- `admin/page.tsx`
- `admin/login/page.tsx`
- `admin/pujas/page.tsx`
- `admin/temples/page.tsx`
- `admin/store/page.tsx`
- `admin/reviews/page.tsx`
- `admin/chadhava/page.tsx`
- `admin/library/page.tsx`
- `admin/panchang/page.tsx`
- `admin/astro-tools/page.tsx`

### `src/app/api/`
Backend API routes for auth, bookings, admin functions, and temple data.

### `src/components/`
Reusable UI components.

#### Main groups
- `layout/` → header, footer, navbar, container
- `booking/` → booking and payment UI
- `auth/` → login-related UI
- `admin/` → admin sidebar and content manager
- `astrologer/` → astrologer cards and list UI
- `common/` → loader and empty state
- `ui/` → button, card, input, modal

### `src/hooks/`
Custom React hooks for auth and bookings.

### `src/lib/`
Shared utilities, API helpers, and MongoDB connection.

### `src/pages/api/`
Legacy API routes from the Pages Router.

### `src/types/`
TypeScript type definitions for users, bookings, and astrologers.

### `middleware.ts`
Likely used for route protection and auth checks.

---

## What the App Is Doing

This app is likely built to:

- display spiritual and temple-related content
- let users explore pujas and offerings
- allow online booking
- process payments
- manage user sessions
- give admins control over site content and analytics

---

## Important Notes

- The project uses both **App Router** and **Pages Router** API routes.
- This suggests the codebase may have evolved over time.
- The admin section is separated from the public site.
- MongoDB is likely used as the database because `src/lib/mongodb.ts` exists.

---

## Next Step

To understand the app fully, the next useful step is to inspect:

- `package.json`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/lib/api.ts`
- `src/lib/mongodb.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/bookings/create/route.ts`
- `middleware.ts`
