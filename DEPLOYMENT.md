# QMS System - Deployment Guide

## Local Development Setup

### Windows/Mac/Linux - Local Development

1. **Install MySQL**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0`

2. **Clone/Extract Project**
   ```bash
   cd qms-system
   ```

3. **Create Virtual Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

4. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```

6. **Create Database**
   ```bash
   mysql -u root -p < schema.sql  # If schema file exists
   # Or manually:
   mysql -u root -p
   CREATE DATABASE qms_system;
   EXIT;
   ```

7. **Run Server**
   ```bash
   python main.py
   ```

8. **Access Application**
   - Frontend: http://localhost:8000
   - API Docs: http://localhost:8000/docs (auto-generated)

---

## Production Deployment

### Option 1: Linux Server (Recommended)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.9+
sudo apt install python3.9 python3-pip python3-venv -y

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install Supervisor (for process management)
sudo apt install supervisor -y
```

#### 2. Application Setup
```bash
# Create app directory
sudo mkdir -p /var/www/qms-system
sudo chown $USER:$USER /var/www/qms-system
cd /var/www/qms-system

# Clone/Extract project files
# ... (copy your files here)

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Database Setup
```bash
# Create database and user
sudo mysql -u root
CREATE DATABASE qms_system;
CREATE USER 'qms_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON qms_system.* TO 'qms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Update Environment
```bash
nano .env
# Set:
DB_HOST=localhost
DB_USER=qms_user
DB_PASSWORD=secure_password
DB_NAME=qms_system
SECRET_KEY=your-very-secure-random-key-here
```

#### 5. Setup Supervisor
Create `/etc/supervisor/conf.d/qms.conf`:
```ini
[program:qms]
directory=/var/www/qms-system
command=/var/www/qms-system/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/qms.err.log
stdout_logfile=/var/log/qms.out.log
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start qms
```

#### 6. Setup Nginx Reverse Proxy
Create `/etc/nginx/sites-available/qms`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/qms-system/public/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/qms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: qms_system
      MYSQL_USER: qms_user
      MYSQL_PASSWORD: qms_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - qms_network

  qms:
    build: .
    environment:
      DB_HOST: mysql
      DB_USER: qms_user
      DB_PASSWORD: qms_password
      DB_NAME: qms_system
      SECRET_KEY: your-secret-key
    ports:
      - "8000:8000"
    depends_on:
      - mysql
    networks:
      - qms_network
    volumes:
      - ./public:/app/public

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./public:/var/www/html:ro
    depends_on:
      - qms
    networks:
      - qms_network

volumes:
  mysql_data:

networks:
  qms_network:
    driver: bridge
```

Deploy with:
```bash
docker-compose up -d
```

---

### Option 3: Cloud Platforms

#### Vercel (Frontend Only)
1. Connect GitHub repository
2. Set build command: `npm run build` (or just serve HTML)
3. Deploy

#### Heroku (Full Stack)
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create qms-system

# Set environment variables
heroku config:set DB_HOST=your-mysql-host \
                  DB_USER=your-user \
                  DB_PASSWORD=your-password \
                  DB_NAME=qms_system \
                  SECRET_KEY=your-secret-key

# Deploy
git push heroku main
```

#### AWS EC2
- Follow Option 1 (Linux Server) setup
- Use RDS for MySQL database
- Use Route 53 for domain management
- Use CloudFront for CDN

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Create app from repository
3. Add MySQL database
4. Configure environment variables
5. Deploy

---

## Security Checklist

- [ ] Change default user passwords
- [ ] Use strong SECRET_KEY (generate: `openssl rand -base64 32`)
- [ ] Enable HTTPS/SSL certificates
- [ ] Setup firewall rules
- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Rate limiting on API endpoints
- [ ] CORS properly configured for your domain
- [ ] Database user with limited permissions
- [ ] Regular security updates

---

## Monitoring & Maintenance

### Logging
```bash
# View application logs
tail -f /var/log/qms.out.log

# View error logs
tail -f /var/log/qms.err.log

# View Nginx logs
tail -f /var/log/nginx/access.log
```

### Database Backup
```bash
# Daily backup
mysqldump -u qms_user -p qms_system > backup_$(date +%Y%m%d).sql

# Automated backup with cron
# Add to crontab: 0 2 * * * mysqldump -u qms_user -p password qms_system > /backups/qms_$(date +\%Y\%m\%d).sql
```

### Performance Monitoring
- Monitor CPU/Memory usage
- Check database query performance
- Monitor API response times
- Setup alerts for errors

---

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pip install -r requirements.txt

# Restart service
sudo supervisorctl restart qms
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
journalctl -u supervisor -n 100

# Test manually
python main.py

# Check port is available
lsof -i :8000
```

### Database Connection Issues
```bash
# Test MySQL connection
mysql -h DB_HOST -u DB_USER -p DB_NAME

# Check credentials in .env
cat .env
```

### Nginx Errors
```bash
# Check syntax
sudo nginx -t

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

---

## Performance Optimization

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Implement caching

2. **Application Optimization**
   - Enable gzip compression in Nginx
   - Implement caching headers
   - Optimize static file serving

3. **Infrastructure**
   - Use CDN for static files
   - Load balancing for multiple servers
   - Database replication for redundancy

---

## Support & Documentation

- Full docs: See README.md
- Quick start: See QUICKSTART.md
- API Documentation: http://your-domain.com/docs (auto-generated)

---

**Deployment completed successfully!** 🎉
