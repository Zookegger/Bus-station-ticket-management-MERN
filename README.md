# Bus Station Ticket Management System

A full-stack MEN (MySQL, Express.js, React, Node.js) application for managing bus station operations, including vehicle management, trip scheduling, ticket booking, and user administration.

## Features

- **User Management**: Registration, authentication, and role-based access control (admin, user)
- **Vehicle Management**: CRUD operations for vehicles and vehicle types with detailed specifications
- **Trip Management**: Schedule and manage bus trips with driver assignments
- **Ticket Booking**: Seat selection and booking system with real-time availability
- **Location Management**: Manage bus stations and routes
- **Admin Dashboard**: Comprehensive admin interface for system management
- **Email Notifications**: Automated email confirmations and updates via queue system
- **Real-time Updates**: WebSocket integration for live seat availability, trip status, and notifications (planned)
- **Responsive Design**: Mobile-friendly UI built with Material-UI

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MySQL** database with initialization scripts
- **Redis** for caching and session management
- **WebSocket** for real-time communication (planned)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **Bull** queue for background jobs

### DevOps
- **Docker** and Docker Compose for containerization
- **Nginx** for serving the frontend
- **PM2** for process management (optional)

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **MySQL** (if running without Docker)
- **Redis** (if running without Docker)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zookegger/Bus-station-ticket-management-MERN.git
   cd Bus-station-ticket-management-MERN
   ```

2. **Install dependencies:**
   ```bash
   npm run setup
   ```
   This will install dependencies for both client and server.

## Running the Application

### Using Docker (Recommended)

1. **Configure environment variables:**
   - Copy `.env.docker` to `.env` in the root directory (already configured for development)

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

### Manual Setup (Development)

1. **Set up the database:**
   - Install MySQL and create a database
   - Run the initialization script: `server/database/init.sql`

2. **Configure environment variables:**
   - **Server (.env):** Copy `server/.env.example` to `server/.env` and update database connection, JWT secret, email settings, etc.
   - **Client (.env):** The `client/.env` file is already configured for development. Update `VITE_API_BASE_URL` if your backend runs on a different port.

3. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This will start both the backend and frontend in development mode concurrently.

4. **Access the application:**
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend: http://localhost:5000

**Note:** The project includes npm scripts for convenience:
- `npm run setup` - Install all dependencies
- `npm run dev` - Start development servers
- `npm start` - Start production servers (if configured)

## Deployment

### Production Deployment with Docker

1. **Configure environment variables:**
   - Copy `.env.docker` to `.env` in the root directory
   - Update sensitive values like database passwords, JWT secrets, and email credentials

2. **Build the production images:**
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

### Cloud Deployment Options

#### Heroku
1. **Install Heroku CLI**
2. **Create Heroku apps:**
   ```bash
   heroku create your-app-name-frontend
   heroku create your-app-name-backend
   ```

3. **Deploy backend:**
   ```bash
   cd server
   heroku git:remote -a your-app-name-backend
   git push heroku main
   ```

4. **Deploy frontend:**
   ```bash
   cd client
   npm run build
   heroku git:remote -a your-app-name-frontend
   git push heroku main
   ```

#### Vercel (Frontend) + Railway/Heroku (Backend)
1. **Deploy frontend to Vercel:**
   - Connect your GitHub repo to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Configure environment variables in Vercel dashboard (from `client/.env`)

2. **Deploy backend to Railway or Heroku:**
   - Follow similar steps as above
   - Set environment variables (from `server/.env`)
   - Update frontend environment variables to point to the backend URL

### Environment Variables

#### Server (.env)
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
```

#### Client (.env)
The client `.env` file contains Vite-specific environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=EasyRide
VITE_APP_EMAIL_ADDRESS=your-email@example.com
NODE_ENV=development
```

## API Documentation

The API endpoints are documented in the server code. Key endpoints include:

- `POST /api/auth/login` - User login
- `GET /api/vehicles` - Get all vehicles
- `POST /api/trips` - Create a new trip
- `POST /api/tickets` - Book a ticket

For detailed API documentation, refer to the Swagger/OpenAPI specs or the route files in `server/src/routes/`.

## Project Structure

```
Bus-station-ticket-management-MERN/
├── client/                          # React frontend
│   ├── Dockerfile                   # Docker configuration for client
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # Main HTML template
│   ├── nginx.conf                  # Nginx configuration for production
│   ├── package.json                # Client dependencies
│   ├── README.md                   # Client-specific documentation
│   ├── tsconfig.app.json           # TypeScript config for app
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.node.json          # TypeScript config for Node.js
│   ├── vite.config.ts              # Vite build configuration
│   ├── public/                     # Static assets
│   └── src/
│       ├── App.css                 # Main app styles
│       ├── App.tsx                 # Main React component
│       ├── index.css               # Global styles
│       ├── main.tsx                # React entry point
│       ├── assets/                 # Static assets (images, fonts)
│       ├── components/             # Reusable UI components
│       │   ├── index.ts            # Component exports
│       │   ├── common/             # Common components
│       │   └── layout/             # Layout components
│       ├── constants/              # Application constants
│       │   └── index.ts            # Constant exports
│       ├── contexts/               # React contexts
│       │   ├── AuthContext.context.tsx
│       │   └── AuthContext.tsx     # Authentication context
│       ├── data/                   # Static data files
│       │   └── menuItems.json      # Navigation menu data
│       ├── hooks/                  # Custom React hooks
│       │   └── useAuth.tsx         # Authentication hook
│       ├── pages/                  # Page components
│       │   ├── DevDebug.tsx        # Development debug page
│       │   ├── index.ts            # Page exports
│       │   ├── admin/              # Admin pages
│       │   ├── common/             # Common pages
│       │   ├── landing/            # Landing pages
│       │   └── user/               # User pages
│       ├── types/                  # TypeScript type definitions
│       │   ├── auth.ts             # Authentication types
│       │   ├── ChipColor.ts        # UI component types
│       │   ├── driver.ts           # Driver types
│       │   ├── location.ts         # Location types
│       │   ├── types.ts            # General types
│       │   ├── user.ts             # User types
│       │   ├── vehicle.ts          # Vehicle types
│       │   ├── vehicleList.ts      # Vehicle list types
│       │   └── vehicleType.ts      # Vehicle type types
│       └── utils/                  # Utility functions
│           └── deviceHooks.tsx     # Device-related hooks
├── server/                          # Node.js backend
│   ├── Dockerfile                   # Docker configuration for server
│   ├── nodemon.json                # Nodemon configuration
│   ├── package.json                # Server dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   ├── database/                   # Database files
│   │   └── init.sql/               # Database initialization script
│   ├── logs/                       # Application logs
│   └── src/
│       ├── app.ts                  # Express app configuration
│       ├── server.ts               # Server entry point
│       ├── config/                 # Configuration files
│       │   ├── database.ts         # Database configuration
│       │   └── redis.ts            # Redis configuration
│       ├── controllers/            # Route controllers
│       │   ├── authController.ts   # Authentication controller
│       │   ├── driverController.ts # Driver management
│       │   ├── locationController.ts # Location management
│       │   ├── routeController.ts  # Route management
│       │   ├── seatController.ts   # Seat management
│       │   ├── tripController.ts   # Trip management
│       │   ├── userController.ts   # User management
│       │   ├── vehicleController.ts # Vehicle management
│       │   └── vehicleTypeController.ts # Vehicle type management
│       ├── middlewares/            # Express middlewares
│       │   ├── auth.ts             # Authentication middleware
│       │   ├── csrf.ts             # CSRF protection
│       │   ├── errorHandler.ts     # Error handling
│       │   └── validateRequest.ts  # Request validation
│       ├── models/                 # Database models
│       │   ├── driver.ts           # Driver model
│       │   ├── index.ts            # Model exports
│       │   ├── location.ts         # Location model
│       │   ├── refreshToken.ts     # Refresh token model
│       │   ├── route.ts            # Route model
│       │   ├── seat.ts             # Seat model
│       │   ├── ticket.ts           # Ticket model
│       │   ├── trip.ts             # Trip model
│       │   ├── tripDriverAssignment.ts # Trip-driver assignment
│       │   ├── user.ts             # User model
│       │   ├── vehicle.ts          # Vehicle model
│       │   └── vehicleType.ts      # Vehicle type model
│       ├── queues/                 # Background job queues
│       │   └── emailQueue.ts       # Email queue
│       ├── routes/                 # API routes
│       │   └── api/                # API route definitions
│       ├── services/               # Business logic services
│       │   ├── authServices.ts     # Authentication services
│       │   ├── driverServices.ts   # Driver services
│       │   ├── emailService.ts     # Email services
│       │   ├── locationServices.ts # Location services
│       │   ├── routeServices.ts    # Route services
│       │   ├── seatServices.ts     # Seat services
│       │   ├── ticketServices.ts   # Ticket services
│       │   ├── tripServices.ts     # Trip services
│       │   ├── userServices.ts     # User services
│       │   ├── vehicleServices.ts  # Vehicle services
│       │   ├── vehicleTypeServices.ts # Vehicle type services
│       │   └── verificationServices.ts # Verification services
│       ├── types/                  # TypeScript type definitions
│       │   ├── driver.ts           # Driver types
│       │   ├── location.ts         # Location types
│       │   ├── route.ts            # Route types
│       │   ├── seat.ts             # Seat types
│       │   ├── ticket.ts           # Ticket types
│       │   ├── trip.ts             # Trip types
│       │   ├── user.ts             # User types
│       │   ├── vehicle.ts          # Vehicle types
│       │   ├── vehicleType.ts      # Vehicle type types
│       │   └── verification.ts     # Verification types
│       ├── utils/                  # Utility functions
│       │   ├── logger.ts           # Logging utilities
│       │   └── request.ts          # Request utilities
│       ├── validators/             # Input validation
│       │   ├── authValidator.ts    # Authentication validation
│       │   ├── driverValidator.ts  # Driver validation
│       │   ├── locationValidator.ts # Location validation
│       │   ├── routeValidator.ts   # Route validation
│       │   ├── seatValidator.ts    # Seat validation
│       │   └── ...                 # Additional validators
│       └── workers/                # Background job workers
├── .env.docker                     # Docker environment variables
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Root Dockerfile
├── LICENSE                         # Project license
├── package.json                    # Root package.json with scripts
└── README.md                       # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.