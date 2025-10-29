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

## Quick Start

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Zookegger/Bus-station-ticket-management-MERN.git
    cd Bus-station-ticket-management-MERN
    ```

2. **Install dependencies:**

    ```bash
    npm run setup
    ```

3. **Run with Docker (Recommended):**

    ```bash
    docker compose up --build
    ```

4. **Access the application:**
    - Frontend: <http://localhost:5173> (VITE)
    - Frontend: <http://localhost:3000> (Development)
    - Backend API: <http://localhost:5000>

## Documentation

- **[Developer Setup](DEV-SETUP.md)** - Step-by-step local and Docker setup for contributors
- **[Deployment Guide](DEPLOYMENT.md)** - Detailed deployment instructions for various platforms
- **[Environment Variables](ENVIRONMENT.md)** - Complete environment configuration guide
- **[API Documentation](API-DOCS.md)** - API endpoints and usage guide
- **[Nginx Configuration](NGINX-CONFIG.md)** - Nginx setup and configuration details

## Project Structure

```text
Bus-station-ticket-management-MERN/
├── client/                          # React frontend
│   ├── public/                      # Static assets
│   └── src/
│       ├── components/              # Reusable UI components
│       │   ├── common/              # Common components
│       │   └── layout/              # Layout components
│       ├── constants/               # Application constants
│       ├── contexts/                # React contexts
│       ├── data/                    # Static data files
│       ├── hooks/                   # Custom React hooks
│       ├── pages/                   # Page components
│       │   ├── admin/               # Admin pages
│       │   ├── common/              # Common pages
│       │   ├── landing/             # Landing pages
│       │   └── user/                # User pages
│       ├── types/                   # TypeScript type definitions
│       └── utils/                   # Utility functions
├── server/                          # Node.js backend
│   ├── database/                    # Database files
│   ├── logs/                        # Application logs
│   └── src/
│       ├── config/                  # Configuration files
│       ├── controllers/             # Route controllers
│       ├── middlewares/             # Express middlewares
│       │   └── validators/          # Input validation
│       ├── models/                  # Database models
│       ├── routes/                  # API routes
│       ├── services/                # Business logic services
│       ├── types/                   # TypeScript type definitions
│       └── utils/                   # Utility functions
│           ├── queues/              # Background job queues
│           └── workers/             # Background job workers
├── .env.docker                      # Docker environment variables
├── API-DOCS.md                      # API documentation
├── DEPLOYMENT.md                    # Deployment guide
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Root Dockerfile
├── ENVIRONMENT.md                   # Environment variables guide
├── LICENSE                          # Project license
├── NGINX-CONFIG.md                  # Nginx configuration documentation
├── package.json                     # Root package.json with scripts
└── README.md                        # This file
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
