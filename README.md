# GenZ IITian Platform - System Audit & Documentation
**Last Updated:** April 2026

> **Disclaimer:** This document is a brutally honest, production-level engineering review of the GenZ IITian purchasing platform (LMS + Payments + Referrals + Sheets + Emails). It does not sugarcoat architectural flaws and focuses purely on structural scaling, security, and maintainability.

---

## 1. SYSTEM OVERVIEW
This platform serves as the storefront, payment processing, and referral engine for GenZ IITian. It handles user acquisition, checkout, and initial access delegation to a separate LMS.

### End-to-End User Flow
1. **Signup/Auth:** Handled via Supabase Auth (likely Google/Email). Uses a `profiles` table synced with `auth.users`.
2. **Browsing / Cart:** Users browse courses/bundles, apply discount codes, or use referral codes. They can also apply "coins" earned from their own referral wallet.
3. **Checkout (Create Order):** Frontend sends cart details to `/api/create-order`. The server calculates the definitive price (preventing client-side price tampering) and creates a Razorpay Order ID.
4. **Payment UI:** Frontend invokes the Razorpay checkout modal using the returned Order ID.
5. **Verification & Enrollment:** Upon successful payment, Razorpay returns a signature to the frontend, which forwards it to `/api/verify-payment`. The backend verifies the signature, marks the order as paid, calculates referral rewards/milestones, deducts buyer coins, and finally makes a webhook call to the LMS endpoint (`class.genziitian.in`) to trigger email delivery and course access.
6. **Support / Newsletter:** Users can submit forms that directly hit a Google Apps Script webhook, populating a Google Sheet and theoretically triggering an Apps Script email system.

---

## 2. TECH STACK (DETAILED)
*   **Frontend:** React 19 + Vite + TailwindCSS v4. Beautiful, heavily stylized, modern stack. Vercel routes all `/*` to `index.html` (SPA routing).
*   **Backend (API Layer):** Vercel Serverless Functions (`/api/*` in TypeScript). Chosen for zero-config scaling and free tier limits, but introduces execution timeouts and statelessness.
*   **Database:** Supabase (PostgreSQL). Robust, relational, with Row Level Security (RLS) policies. Perfect for early-to-mid stage startups.
*   **Payment Gateway:** Razorpay. Standard API integration.
*   **External Integrations:**
    *   **LMS Enrollment:** Webhook API call (`LMS_ENROLL_URL`) to an external system protected by an `EXTERNAL_ENROLL_SECRET`.
    *   **Google Apps Script (Sheets):** Used as a free, "hacky" CRM to store Newsletter and Contact Us submissions using `no-cors` frontend fetch calls.

---

## 3. ARCHITECTURE

The architecture relies heavily on separate micro-services bridged by HTTP calls.

```text
[ Frontend (React SPA) ]
      |          |               \
   (Auth)    (Checkout)      (Contact Form)
      |          v                 v
[ Supabase ] [ /api/* Vercel ]  [ Google Apps Script ]
               |         |         |
               v         v         |
         [ Razorpay ] [ Supabase ] v [ Google Sheets ]
                         |
                         v
                [ LMS Webhook (class.genziitian.in) ] ---> [ User Email ]
```

### Where Business Logic Lives:
Business logic is **heavily bleeding into massive Vercel Serverless files** (`create-order.ts` and `verify-payment.ts`). The frontend does some validation, but the ultimate source of truth is the backend logic.

---

## 4. DATA FLOW (CRITICAL)

### Successful Payment Flow:
1. `/api/create-order` calculates price -> creates Razorpay Order -> Inserts `CREATED` row in `website_orders`.
2. User pays -> Client sends signature to `/api/verify-payment`.
3. Server validates signature -> Updates `website_orders` to `PAID`.
4. Server creates `activity_logs` (Success).
5. Server calls `LMS_ENROLL_URL` -> Grants access in LMS.
6. Server evaluates referral: Updates `referral_profiles` wallet for referrer, inserts `referral_transactions`.
7. Server deducts applied coins from buyer's `referral_profiles`.

### Failed Payment Flow:
If the user cancels Razorpay, the order stays in `CREATED` status indefinitely. 
Frontend catches Razorpay errors and redirects to `/payment-failed`, rendering the last attempted order. A `/api/log-payment-failure` endpoint exists but is mostly observational.

### Referral Reward Flow:
Runs *after* LMS enrollment inside `verify-payment.ts`. It compares the original amount, calculates 5%, adds "milestone bonuses" (via `referral_milestones`), and updates the `wallet_balance` via a Supabase `update()` call.

---

## 5. DATABASE DESIGN

The relational mappings are solid, but have caveats.
*   `profiles`: Contains basic auth data, maps 1:1 with `auth.users`. Contains `role` (`MANAGER` vs default).
*   `website_orders`: Stores array of `course_ids` (JSON-like), pricing breakdowns, discounts, status.
*   `referral_profiles`: Tracks `wallet_balance` and referral counters.
*   `referral_transactions`: Audit log for every 5% reward.
*   **Issues:**
    *   Using an array for `course_ids` in `website_orders` violates First Normal Form (1NF). It should be an `order_items` junction table. Doing joins/lookups on JSON arrays in Postgres is terrible for analytics at scale.

---

## 6. SECURITY ANALYSIS (BE HONEST)

1.  **Google Apps Script Abuse (High Risk):** 
    The `Contact Us` and `Newsletter` forms make unauthenticated `no-cors` POST requests directly to `script.google.com`. Anyone can write a 3-line bash script to flood your Google Sheet with gigabytes of garbage data, triggering Google's rate limits and completely shutting down the Apps Script URL.
2.  **Wallet Balance Race Condition (Medium/High Risk):**
    In `verify-payment.ts`, the backend does a `SELECT wallet_balance` ... then does Javascript math (`newBal = balance - used`) ... then does an `UPDATE wallet_balance = newBal`.
    *Exploit:* If a user initiates 3 checkouts simultaneously, all 3 might read a balance of `50`, apply `50` coins, and update the balance to `0`. The user gets 150 coins worth of value out of a 50 coin wallet. This MUST be done atomically in SQL (`UPDATE ... SET wallet_balance = wallet_balance - coins_used RETURNING *`).
3.  **LMS Secret Exposure Risk (Low/Medium Risk):**
    The `EXTERNAL_ENROLL_SECRET` relies completely on environment variables. If these logs are leaked, unauthorized enrollments can occur. It's an acceptable industry practice, but ideally, this should use short-lived HMACs.

---

## 7. PERFORMANCE & SCALING

*   **Current Capacity (<100 users/day):** Works perfectly. Supabase and Vercel will handle this without breaking a sweat.
*   **500 Users / day (Spike Scenarios):**
    *   **Bottleneck 1: `verify-payment.ts` sequence.** The script waits for `fetch(LMS_ENROLL_URL)` to complete before processing referrals and answering the customer. If the LMS server is under load and takes 8 seconds to respond, Vercel Serverless functions (which have strict timeouts, usually 10s on free/hobby tier) might kill the process, leaving the payment Verified but referrals uncredited.
*   **Google Apps Script Limits:** Google limits concurrent executions and daily quotas. At a moderate scale, Google will start returning HTTP 429 (Too Many Requests), causing silent failures on contact forms.

---

## 8. FAILURE POINTS (VERY IMPORTANT)

1. **Payment Verified, LMS Down (Critical):**
    If the LMS webhook returns a 500 error, `verify-payment.ts` catches it, logs an `ENROLLMENT_FAILURE` in the DB, and **returns 200 OK to the frontend**. 
    *Impact:* The user gets a success screen, Razorpay takes their money, but they have no course access. Because `verify-payment.ts` succeeded, there is no automatic retry mechanism. You essentially rely on the user angrily emailing you.
2. **Payment Verified, Vercel Timeout (Critical):**
    If the function times out halfway through (e.g. after LMS enroll, before Referral reward), databases are out of sync. There are NO SQL Transactions backing up `verify-payment.ts`. If it fails midway, you manually have to hunt down missing referrals.
3. **Apps Script Silent Fails:**
    Because the frontend uses `no-cors` for Google Sheets, it physically cannot read the response. If the script fails, the frontend still says "Thanks for subscribing!", creating a terrible UX gap.

---

## 9. EDGE CASES
1. **User pays and closes the tab instantly:** Wait, the frontend triggers `verify-payment.ts`. If the user closes the tab before the Razorpay success callback fires, `verify-payment` is never called. Razorpay captures the money, but the webhook is entirely frontend-driven right now. **You MUST implement Razorpay Webhooks (`payment.captured`) on the backend to guarantee fulfillment if the user's browser crashes.**
2. **Partial Course Overlap:** Buying a bundle and a course already in the bundle doesn't elegantly reject or discount the duplicate.
3. **Discounts on 0-value items:** Total amount is hard-clamped to `>= ₹1` which is required for Razorpay, but the math leading up to it can cause negative balances if you aren't careful adding more coupons.

---

## 10. CODE QUALITY REVIEW

*   **Structure:** Standard for an MVP. `api/` mixed into a Vite frontend repo leveraging Vercel. 
*   **Maintainability:** Poor in the API layer. `create-order.ts` and `verify-payment.ts` are massive spaghetti codes performing too many distinct duties (Auth verify, Price config, Razorpay interaction, Third-party LMS calls, Gamification/Milestones logic, Wallet updating).
*   **Coupling:** The API is highly tightly coupled. If you change how coins work, you have to parse through the checkout file.
*   **Missing Abstractions:** You desperately need a service layer (e.g., `ReferralService`, `OrderService`, `PaymentService`) instead of raw procedural code.

---

## 11. YOUR OPINION (VERY IMPORTANT)

*   **Would I trust this in production?** For a startup making its first $1,000 to $10,000, yes. For a scaled business, **absolutely not**. The lack of server-to-server Razorpay webhooks (relying on frontend to verify) is the single biggest "junior" mistake in the system.
*   **What feels hacky?** The Google Apps Script integration. `no-cors` fetch requests to a Google Sheet is an MVP hack that needs to die before scaling. The lack of SQL transactions for multi-step balance tracking is also scary.
*   **What is surprisingly good?** The Frontend UI. It is gorgeous. The Supabase RLS mapping and the fact that you correctly moved pricing calculation to the backend (many beginners trust frontend prices) shows a solid security mindset.
*   **What is risky?** The total reliance on the frontend remaining open to complete the `verify-payment` call. 

---

## 12. RECOMMENDATIONS (ACTIONABLE)

### Immediate Fixes (High Priority - Do this week)
1. **Implement Razorpay Webhooks (`payment.authorized` / `order.paid`):** Expose an endpoint that Razorpay calls directly. Do not rely exclusively on the frontend firing `verify-payment`.
2. **Add Transactional Safe-Guards:** Update coin balances using SQL decrement operators, not `JS Math -> SQL Update`. 
3. **LMS Failure Retry:** If LMS fails, queue it to a separate table (`failed_enrollments`) and write a cron job or Supabase edge function to retry them, rather than just logging it and forgetting it.

### Medium Improvements
1. **Kill Google Sheets:** Set up Resend or AWS SES for emails. Use a Supabase table for `contact_submissions` instead of a naked Google Sheet API.
2. **Refactor API:** Split `verify-payment.ts` into individual services: `PaymentService.verify()`, `LMSService.enroll()`, `ReferralService.processRewards()`.

### Long-term Architecture
1. Move to a dedicated backend framework (e.g., NestJS, Express in a robust container, or pure Next.js API Routes if migrating to Next) to handle background jobs cleanly (e.g., BullMQ for processing enrollments asynchronously so the user isn't waiting on the payment loading screen for an LMS webhook to fire).

---

## 13. HOW TO RUN THIS PROJECT

### Prerequisites
* Node.js v18+
* Supabase Account
* Razorpay Account

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
VITE_APP_ENV=local # or production
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_for_backend_bypasses
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_SECRET=your_backend_rzp_secret
LMS_ENROLL_URL=url_to_webhook
EXTERNAL_ENROLL_SECRET=secret_for_webhook
```

### Setup & Run
```bash
# Install dependencies
npm install

# Start frontend (Vite)
npm run dev

# (Note: API functions in /api rely on Vercel deployment. To test locally, use vercel dev)
npm i -g vercel
vercel dev
```

### Deployment (Vercel)
The project connects directly to Vercel. 
The `vercel.json` maps frontend routing to `index.html` and ensures `/api/` hits the serverless functions. Ensure all environment variables are populated securely in the Vercel dashboard. Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to the `VITE_` prefix.
