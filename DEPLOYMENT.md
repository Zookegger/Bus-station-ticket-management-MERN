# Deployment Guide

This guide covers various deployment options for the Bus Station Ticket Management System.

## Production Deployment with Docker

1. **Configure environment variables:**

    - Copy `.env.docker` to `.env` in the root directory
    - Update sensitive values like database passwords, JWT secrets, and email credentials

2. **Build the production images:**

    ```bash
    docker compose -f docker-compose.yml up --build -d
    ```

3. **Access the application:**
    - Frontend: <http://localhost:80>
    - Backend API: <http://localhost:5000>

## Cloud Deployment Options

### Heroku

1. **Install Heroku CLI**
2. **Create Heroku apps:**

    ```bash
    heroku create bus-station-frontend
    heroku create bus-station-backend
    ```

3. **Deploy backend:**

    ```bash
    cd server
    heroku git:remote -a bus-station-backend
    git push heroku main
    ```

4. **Deploy frontend:**

    ```bash
    cd client
    npm run build
    heroku git:remote -a bus-station-frontend
    git push heroku main
    ```

### Vercel (Frontend) + Railway/Heroku (Backend)

1. **Deploy frontend to Vercel:**

    - Connect your GitHub repo to Vercel
    - Set build command: `npm run build`
    - Set output directory: `dist`
    - Configure environment variables in Vercel dashboard (from `client/.env`)

2. **Deploy backend to Railway or Heroku:**
    - Follow similar steps as above
    - Set environment variables (from `server/.env`)
    - Update frontend environment variables to point to the backend URL

## Manual Setup (Development)

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
    - Frontend: <http://localhost:5173> (Vite dev server)
    - Backend: <http://localhost:5000>

**Note:** The project includes npm scripts for convenience:

- `npm run setup` - Install all dependencies
- `npm run dev` - Start development servers
- `npm start` - Start production servers (if configured)
