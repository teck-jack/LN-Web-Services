# Razorpay Configuration Guide

## Environment Variables Required

### Backend (.env)
```env
# Razorpay API Credentials
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# For Production (when ready)
# RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### Frontend (.env)
```env
# Razorpay Public Key (same as backend KEY_ID)
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# For Production
# VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
```

---

## How to Get Razorpay Credentials

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com/
2. Click "Sign Up" (free for testing)
3. Complete registration

### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (for testing)
4. You'll get:
   - **Key ID**: `rzp_test_XXXXXXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXXXXXXXXXX`

### Step 3: Add to .env Files

**Backend (.env):**
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Frontend (.env):**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

---

## Test Mode vs Live Mode

### Test Mode (Development)
- Use `rzp_test_` keys
- No real money charged
- Use test cards for testing

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### Live Mode (Production)
- Use `rzp_live_` keys
- Real money will be charged
- Real cards required
- KYC verification needed

---

## Current Implementation Status

✅ **Backend:**
- Razorpay SDK installed
- Order creation endpoint ready
- Payment verification ready
- Webhook support ready

✅ **Frontend:**
- Razorpay checkout script integration
- Payment dialog with Razorpay option
- Success/failure handling
- Test mode toggle

---

## Testing Checklist

### 1. Test Mode Payment
- [ ] Set `RAZORPAY_KEY_ID` in backend .env
- [ ] Set `VITE_RAZORPAY_KEY_ID` in frontend .env
- [ ] Restart both servers
- [ ] Try enrollment with online payment
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Verify payment success

### 2. Payment Verification
- [ ] Check payment record in database
- [ ] Verify case created
- [ ] Check invoice number generated
- [ ] Verify transaction ID saved

### 3. Error Handling
- [ ] Try with invalid card
- [ ] Try canceling payment
- [ ] Verify error messages shown

---

## Security Best Practices

### ✅ Do's
- ✅ Keep `RAZORPAY_KEY_SECRET` in backend only
- ✅ Never expose secret key in frontend
- ✅ Use HTTPS in production
- ✅ Verify payment signatures on backend
- ✅ Use environment variables

### ❌ Don'ts
- ❌ Don't commit .env files to git
- ❌ Don't expose secret key in client code
- ❌ Don't skip signature verification
- ❌ Don't trust client-side payment status

---

## Webhook Configuration (Optional)

For production, set up webhooks to handle payment events:

1. Go to Razorpay Dashboard → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
4. Save webhook secret in .env:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## Example .env Files

### Backend .env (Complete)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Razorpay (TEST MODE)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend .env (Complete)
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# App Config
VITE_APP_NAME=LN Services
VITE_APP_VERSION=1.0.0
```

---

## Quick Start

1. **Get Razorpay Keys:**
   ```
   https://dashboard.razorpay.com/app/keys
   ```

2. **Add to Backend .env:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   ```

3. **Add to Frontend .env:**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
   ```

4. **Restart Servers:**
   ```bash
   # Backend
   cd backend && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

5. **Test Payment:**
   - Select a service
   - Choose "Online Payment"
   - Use test card: 4111 1111 1111 1111
   - Complete payment

---

## Support

- **Razorpay Docs:** https://razorpay.com/docs/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Dashboard:** https://dashboard.razorpay.com/

---

**Status:** ✅ Ready to use after adding credentials!
