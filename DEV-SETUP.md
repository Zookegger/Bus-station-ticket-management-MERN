# Developer Setup (So Easy Even a Caveman Can Do It)

This guide gets you from zero to running app in minutes. Two easy paths:

- Option A: One-command Docker setup (fastest, least fuss)
- Option B: Local dev (Node + MySQL + Redis on your machine)

Pick one. Don’t do both at the same time.

---

## Option A — Run Everything with Docker (Recommended)

**What you get:**

- MySQL, Redis, API server, and Frontend all started for you
- Pre-configured environment using `.env.docker`

**Steps:**

1. Install the basics

   - Docker + Docker Compose

2. Start the whole stack

   ```bash
   # From the project root
   docker compose up --build
   ```

3. Open the app

   - Frontend (Docker): <http://localhost:3000>
   - API: <http://localhost:5000>
   - API health check: <http://localhost:5000/>

Done. If you want to stop it:

```bash
docker compose down
```

**Important:** Docker uses `.env.docker` (not `.env`) for all its configuration. This file is already in the project root with working defaults. If you need to customize:

- Open `.env.docker` and adjust values (DB passwords, SMTP, secrets, etc.)
- Don't confuse it with `server/.env` (that's for local dev only)
- MySQL inside Docker listens on your machine at port 3307 (mapped from 3306 in the container)

---

## Option B — Local Dev (Run server and client on your machine)

**What you get:**

- Hot reload for both server and client
- You control MySQL and Redis locally
- Uses `server/.env` and `client/.env` (separate from Docker's `.env.docker`)

### 1) Install the basics

- Node.js 18+
- npm 9+
- MySQL 8+
- Redis 7+

### 2) Install dependencies

```bash
# From the project root
npm run setup
```

This installs packages for both `server` and `client`.

### 3) Create env files

Create `server/.env` with this minimal working setup:

```env
# Client
CLIENT_URL=http://localhost
CLIENT_PORT=5173

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (use placeholders for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=demo@example.com
SMTP_PASS=app-password-or-blank
FROM_EMAIL=noreply@easyride.com

# Server
PORT=5000
NODE_ENV=development
CSRF_SECRET=replace_me_with_random_string

# Database (local MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_db_password
DB_NAME=bus_station_db
DB_LOGGING=false

# Auth
JWT_SECRET=replace_me_with_long_random_string
JWT_EXPIRES_IN=3600s
REFRESH_TOKEN_SECRET=replace_me_with_long_random_string_2
REFRESH_TOKEN_EXPIRES_IN=30d

# Misc
VERIFICATION_TOKEN_EXPIRY=86400

# Payments (optional for local)
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:4000/api/payments/vnpay/return
VNP_LOCALE=vn
VNP_ORDER_TYPE=other

# MoMo (optional for local)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_PUBLIC_KEY=
MOMO_API_ENDPOINT=https://test-payment.momo.vn
MOMO_REDIRECT_URL=http://localhost:3000/payment-success
MOMO_IPN_URL=http://localhost:5000/api/momo-ipn
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=EasyRide
VITE_APP_EMAIL_ADDRESS=your-email@example.com
NODE_ENV=development
```

Tip: Generate strong secrets with the helper script:

```bash
# From project root
bash ./generate-new-key-secret.sh 48 base64
bash ./generate-new-key-secret.sh 64 hex
```

### 4) Prepare the database

- Start MySQL and Redis locally
- Create the database and import schema

```bash
# Create database (adjust password/port as needed)
mysql -h 127.0.0.1 -P 3306 -u root -p -e "CREATE DATABASE IF NOT EXISTS bus_station_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema into that database
mysql -h 127.0.0.1 -P 3306 -u root -p bus_station_db < schema.sql
```

If you prefer Docker for just MySQL and Redis (but still run app locally):

```bash
# MySQL on port 3306
sudo docker run -d --name easyride-mysql -e MYSQL_ROOT_PASSWORD=rootpassword -p 3306:3306 mysql:8

# Redis on port 6379
sudo docker run -d --name easyride-redis -p 6379:6379 redis:7-alpine
```

Adjust `server/.env` DB_PASS to match the `MYSQL_ROOT_PASSWORD` you set.

### 5) Run the app (local dev)

```bash
# From the project root
npm run dev
```

This starts:

- Server (Express + TypeScript) on <http://localhost:5000>
- Client (Vite) on <http://localhost:5173>

### 6) Sanity check

- API health: <http://localhost:5000/>
- Open app: <http://localhost:5173>

You should see logs in your terminal. If you can open both URLs, you’re good.

---

## Troubleshooting (Read me if stuck)

- Ports busy?
  - MySQL: change `DB_PORT` in `server/.env` or stop other MySQL instances
  - Redis: port 6379 in use; stop other Redis or change `REDIS_PORT`
  - Vite uses 5173; API uses 5000. Change if needed.

- MySQL auth plugin error (caching_sha2_password)?
  - Use MySQL 8+ and default settings, or create a user with native password:

    ```sql
    CREATE USER 'easyride_user'@'%' IDENTIFIED WITH mysql_native_password BY 'easyride_pass';
    GRANT ALL PRIVILEGES ON bus_station_db.* TO 'easyride_user'@'%';
    FLUSH PRIVILEGES;
    ```

  - Update `DB_USER`/`DB_PASS` in `server/.env` accordingly.

- Can’t connect to DB?
  - Check `DB_HOST`, `DB_PORT`, and firewall
  - Try: `mysql -h 127.0.0.1 -P 3306 -u root -p`

- Seats or trips not generating?
  - Ensure your Vehicle Types have `totalSeats` and either a layout JSON or totals.
  - Example JSON fields (as strings):
    - rowsPerFloor: "[10]"
    - seatsPerFloor: "[[1,1,0,1,1],[1,1,0,1,1]]"

- Emails not sending?
  - For local dev, set dummy SMTP creds or use a testing SMTP (e.g., Mailtrap).

---

## Handy Scripts

- Install all deps: `npm run setup`
- Run both dev servers: `npm run dev`
- Run only server dev: `npm run server_dev`
- Run only client dev: `npm run client_dev`
- Build backend only: in `server/` → `npm run build`

---

## Where Things Live

- Backend code: `server/src`
- Frontend code: `client/src`
- API routes: `server/src/routes/api`
- DB config: `server/src/config/database.ts`
- Env docs: `ENVIRONMENT.md`

If anything is unclear, open an issue or ping a maintainer.
