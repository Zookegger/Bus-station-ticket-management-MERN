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

2. **Install dependencies for the client:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install dependencies for the server:**
   ```bash
   cd server
   npm install
   cd ..
   ```

## Running the Application

### Using Docker (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

### Manual Setup (Development)

1. **Set up the database:**
   - Install MySQL and create a database
   - Run the initialization script: `server/database/init.sql`

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the server directory
   - Update database connection, JWT secret, email settings, etc.

3. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```

4. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend: http://localhost:5000

## Deployment

### Production Deployment with Docker

1. **Build the production images:**
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the root directory with production settings
   - Ensure database credentials, JWT secrets, and email configurations are set

3. **Set up reverse proxy (optional):**
   - Use Nginx or Apache to proxy requests to the containerized app
   - Configure SSL certificates for HTTPS

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

2. **Deploy backend to Railway or Heroku:**
   - Follow similar steps as above
   - Update frontend environment variables to point to the backend URL

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bus_station_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173

# Server
PORT=5000
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
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   └── services/       # Business logic
│   ├── database/           # Database scripts
│   └── package.json
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker build files
└── README.md
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