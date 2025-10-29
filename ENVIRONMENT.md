# Environment Variables Configuration

This document describes all the environment variables required to run the Bus Station Ticket Management System.

## Server Environment Variables (.env)

Create a `.env` file in the server directory with the following variables:

```env
# Client Configuration
CLIENT_URL=http://localhost
CLIENT_PORT=5173

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@easyride.com

# Server Configuration
PORT=5000
NODE_ENV=development
CSRF_SECRET=replace_with_a_strong_csrf_secret

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_db_password
DB_NAME=bus_station_db
DB_LOGGING=false

# Authentication Configuration
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=3600s
REFRESH_TOKEN_SECRET=replace_with_another_secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Verification Configuration
VERIFICATION_TOKEN_EXPIRY=86400

# VNPay configuration (for payments)
VNP_TMN_CODE=YOUR_TMN_CODE
VNP_HASH_SECRET=YOUR_VNP_HASH_SECRET
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:4000/api/payments/vnpay/return
VNP_LOCALE=vn
VNP_ORDER_TYPE=other

# MoMo configuration (for payments)
MOMO_PARTNER_CODE=YOUR_MOMO_PARTNER_CODE
MOMO_ACCESS_KEY=YOUR_MOMO_ACCESS_KEY
MOMO_SECRET_KEY=YOUR_MOMO_SECRET_KEY
MOMO_PUBLIC_KEY=YOUR_MOMO_PUBLIC_KEY
MOMO_API_ENDPOINT=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:3000/payment-success
MOMO_IPN_URL=http://localhost:5000/api/momo-ipn
```

### Variable Descriptions

#### Client Configuration

- `CLIENT_URL`: URL where the frontend is hosted
- `CLIENT_PORT`: Port where the frontend development server runs

#### Redis Configuration

- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis server password (leave empty if no password)

#### Email Configuration

- `SMTP_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASS`: SMTP password or app password
- `FROM_EMAIL`: Email address to send emails from

#### Server Configuration

- `PORT`: Port for the Express server
- `NODE_ENV`: Environment mode (development/production)
- `CSRF_SECRET`: Secret key for CSRF protection

#### Database Configuration

- `DB_HOST`: MySQL database hostname
- `DB_PORT`: MySQL database port
- `DB_USER`: MySQL database username
- `DB_PASS`: MySQL database password
- `DB_NAME`: MySQL database name
- `DB_LOGGING`: Enable/disable database query logging

#### Authentication Configuration

- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT token expiration time
- `REFRESH_TOKEN_SECRET`: Secret key for refresh token signing
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration time

#### Verification Configuration

- `VERIFICATION_TOKEN_EXPIRY`: Email verification token expiration time in seconds

#### Payment Configuration (VNPay)

- `VNP_TMN_CODE`: VNPay merchant code
- `VNP_HASH_SECRET`: VNPay hash secret
- `VNP_URL`: VNPay payment URL
- `VNP_RETURN_URL`: Return URL after payment
- `VNP_LOCALE`: Payment locale
- `VNP_ORDER_TYPE`: Order type for payments

#### Payment Configuration (MoMo)

- `MOMO_PARTNER_CODE`: MoMo partner/merchant code
- `MOMO_ACCESS_KEY`: MoMo access key for API authentication
- `MOMO_SECRET_KEY`: MoMo secret key for request signing
- `MOMO_PUBLIC_KEY`: MoMo public key for encryption
- `MOMO_API_ENDPOINT`: MoMo API endpoint URL (sandbox or production)
- `MOMO_REDIRECT_URL`: URL to redirect user after payment
- `MOMO_IPN_URL`: Instant Payment Notification callback URL

## Client Environment Variables (.env)

The client `.env` file contains Vite-specific environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=EasyRide
VITE_APP_EMAIL_ADDRESS=your-email@example.com
NODE_ENV=development
```

### Client Variable Descriptions

- `VITE_API_BASE_URL`: Base URL for API calls (must include /api)
- `VITE_APP_NAME`: Application name displayed in the UI
- `VITE_APP_EMAIL_ADDRESS`: Support/contact email address
- `NODE_ENV`: Environment mode for the client

## Docker Environment Variables (.env.docker)

The `.env.docker` file in the root directory is pre-configured for Docker development:

```env
# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=bus_station_db
MYSQL_USER=easyride_user
MYSQL_PASSWORD=easyride_pass

# Redis
REDIS_PASSWORD=

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost
CLIENT_PORT=80
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=easyride_user
DB_PASS=easyride_pass
DB_NAME=bus_station_db
DB_LOGGING=false
REDIS_HOST=redis_db
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=3600s
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here_make_it_long_and_random
REFRESH_TOKEN_EXPIRES_IN=30d
CSRF_SECRET=your_csrf_secret_here_make_it_random_and_long
VERIFICATION_TOKEN_EXPIRY=86400
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@easyride.com
VNP_TMN_CODE=YOUR_TMN_CODE
VNP_HASH_SECRET=YOUR_VNP_HASH_SECRET
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost/api/payments/vnpay/return
VNP_LOCALE=vn
VNP_ORDER_TYPE=other

# MoMo
MOMO_PARTNER_CODE=YOUR_MOMO_PARTNER_CODE
MOMO_ACCESS_KEY=YOUR_MOMO_ACCESS_KEY
MOMO_SECRET_KEY=YOUR_MOMO_SECRET_KEY
MOMO_PUBLIC_KEY=YOUR_MOMO_PUBLIC_KEY
MOMO_API_ENDPOINT=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:3000/payment-success
MOMO_IPN_URL=http://localhost:5000/api/momo-ipn
```

## Security Notes

- **Never commit `.env` files** to version control
- Use strong, random secrets for JWT, CSRF, and other sensitive keys
- For production, use environment-specific secrets
- Rotate secrets regularly
- Use app passwords for email services like Gmail
