# Nginx Configuration

The application uses Nginx as a reverse proxy for serving the React frontend and proxying API requests to the backend. The nginx configuration file is located at `client/nginx.conf`.

## Configuration File

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access_log;
    error_log /var/log/nginx/error_log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 3000;
        server_name localhost;

        # Serve React app
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # API proxy to backend (for development)
        location /api/ {
            proxy_pass http://easyride_server:5000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket proxy for Socket.io
        location /socket.io/ {
            proxy_pass http://easyride_server:5000/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Configuration Explanation

- **Server Block**: Listens on port 3000 and serves the React application
- **Static File Serving**: Serves the built React app from `/usr/share/nginx/html`
- **SPA Routing**: Uses `try_files` to handle client-side routing (redirects all non-API requests to `index.html`)
- **API Proxy**: Forwards `/api/` requests to the backend server running on port 5000
- **WebSocket Support**: Proxies WebSocket connections for real-time features (Socket.io)
- **Gzip Compression**: Enabled for better performance
- **Logging**: Access and error logs are configured

## Customization

To modify the nginx configuration:

1. Edit `client/nginx.conf`
2. Rebuild the Docker containers: `docker compose up --build`
3. For production deployment, you may need to adjust:
   - Server name and port
   - SSL/TLS configuration
   - Backend server URLs
   - Security headers