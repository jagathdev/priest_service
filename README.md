# Priest Service Application

An e-commerce style app for booking Hindu puja and homa services.

## Architecture

- **Backend (`/server`)**: Node.js (ESM), Express 5, Mongoose 9. Deployed independently.
- **Frontend (`/client`)**: Next.js 16 (App Router), React 19, TypeScript, Tailwind 3. Deployed on Vercel.
- **Database**: MongoDB.

## Setup Instructions

### Backend (Server)
1. Navigate to `/server`.
2. Ensure you have Node.js >= 20 installed.
3. Run `npm install` to install dependencies.
4. Copy `server/.env.example` to `server/.env` and populate the variables:
   - `MONGO_URI`
   - `JWT_SECRET` (must be at least 32 characters)
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD` (for seeding)
5. Run `npm run dev` to start the development server.

### Frontend (Client)
1. Navigate to `/client`.
2. Run `npm install` to install dependencies.
3. Copy `client/.env.example` to `client/.env` and populate the variables.
4. Run `npm run dev` to start the development server.

## Testing

- **Backend**: Run `npm test` inside the `/server` directory to run Jest and Supertest suites.
- **Frontend**: Refer to standard Next.js testing protocols or package.json for test scripts.

## Deployment

- The frontend is ready for Vercel deployment. Ensure you link the GitHub repository and supply the production environment variables.
- The backend should be deployed to a Node.js hosting provider (like Render, Railway, AWS, or similar) with secure environment variables. Make sure your MongoDB IP access list includes your backend host.
- See `docs/PRODUCTION_CHECKLIST.md` for a comprehensive list of launch requirements.
