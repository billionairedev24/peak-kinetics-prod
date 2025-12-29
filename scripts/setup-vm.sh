#!/bin/bash
# Complete VM setup with Nginx and SSL certificates
# Run this script on your GCP VM

set -e

echo "🚀 Setting up Peak Kinetics VM with Nginx and SSL..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not installed
if ! command -v docker compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
fi

# Install Java 21 if not installed
if ! command -v java &> /dev/null; then
    echo "☕ Installing Java 21..."
    sudo apt-get install -y openjdk-21-jdk
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Install Certbot for Let's Encrypt
if ! command -v certbot &> /dev/null; then
    echo "🔒 Installing Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Create deployment directory
echo "📁 Creating deployment directories..."
mkdir -p ~/deployment/backend/target
mkdir -p ~/deployment/uploads/blog/images

# Create log directory
sudo mkdir -p /var/log/peakkinetics
sudo chown $USER:$USER /var/log/peakkinetics

# Configure Nginx - INITIAL HTTP-ONLY configuration
echo "⚙️  Configuring Nginx (HTTP only for now)..."

sudo tee /etc/nginx/sites-available/peakkinetics > /dev/null <<'EOF'
# Initial HTTP-only configuration for Let's Encrypt verification
server {
    listen 80;
    listen [::]:80;
    server_name peakkineticspt.com www.peakkineticspt.com
                peakkineticspt.net www.peakkineticspt.net
                peakkineticspt.store www.peakkineticspt.store
                peakkineticspt.shop www.peakkineticspt.shop
                peakkineticspt.info www.peakkineticspt.info;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Temporary: Proxy to Spring Boot (will be replaced with HTTPS redirect after SSL)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/peakkinetics /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
echo "▶️  Starting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "✅ Nginx is running on HTTP"
echo ""

# Check DNS before proceeding
echo "==================================="
echo "DNS VERIFICATION"
echo "==================================="
echo "Checking if domains point to this server..."
echo ""

SERVER_IP=$(curl -s ifconfig.me)
echo "This server's IP: $SERVER_IP"
echo ""

DOMAINS=(
    "peakkineticspt.com"
    "www.peakkineticspt.com"
    "peakkineticspt.net"
    "www.peakkineticspt.net"
    "peakkineticspt.store"
    "www.peakkineticspt.store"
    "peakkineticspt.shop"
    "www.peakkineticspt.shop"
    "peakkineticspt.info"
    "www.peakkineticspt.info"
)

ALL_GOOD=true
for domain in "${DOMAINS[@]}"; do
    RESOLVED_IP=$(dig +short "$domain" | tail -n1)
    if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
        echo "✅ $domain → $RESOLVED_IP"
    else
        echo "❌ $domain → $RESOLVED_IP (expected $SERVER_IP)"
        ALL_GOOD=false
    fi
done

echo ""
if [ "$ALL_GOOD" = false ]; then
    echo "⚠️  WARNING: Not all domains are configured correctly!"
    echo "Please update your DNS records before obtaining SSL certificates."
    echo ""
fi

echo "==================================="
echo "SSL CERTIFICATE SETUP"
echo "==================================="
echo ""
read -p "Do you want to obtain SSL certificates now? (yes/no): " ssl_ready

if [ "$ssl_ready" = "yes" ]; then
    read -p "Enter your email address for Let's Encrypt: " email_address

    echo ""
    echo "🔒 Obtaining SSL certificates for all domains..."

    # Obtain certificate for all domains
    sudo certbot --nginx \
        -d peakkineticspt.com \
        -d www.peakkineticspt.com \
        -d peakkineticspt.net \
        -d www.peakkineticspt.net \
        -d peakkineticspt.store \
        -d www.peakkineticspt.store \
        -d peakkineticspt.shop \
        -d www.peakkineticspt.shop \
        -d peakkineticspt.info \
        -d www.peakkineticspt.info \
        --non-interactive \
        --agree-tos \
        --email "$email_address" \
        --redirect

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SSL certificates obtained successfully!"

        # Now update Nginx config with full HTTPS setup
        echo "⚙️  Updating Nginx configuration for full HTTPS..."

        sudo tee /etc/nginx/sites-available/peakkinetics > /dev/null <<'EOFSSL'
# Redirect all HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name peakkineticspt.com www.peakkineticspt.com
                peakkineticspt.net www.peakkineticspt.net
                peakkineticspt.store www.peakkineticspt.store
                peakkineticspt.shop www.peakkineticspt.shop
                peakkineticspt.info www.peakkineticspt.info;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name peakkineticspt.com www.peakkineticspt.com;

    ssl_certificate /etc/letsencrypt/live/peakkineticspt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/peakkineticspt.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 10M;

    # Proxy to Spring Boot application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /actuator/health {
        proxy_pass http://localhost:8080/actuator/health;
        access_log off;
    }
}

# Additional domains redirect to main domain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name peakkineticspt.net www.peakkineticspt.net
                peakkineticspt.store www.peakkineticspt.store
                peakkineticspt.shop www.peakkineticspt.shop
                peakkineticspt.info www.peakkineticspt.info;

    ssl_certificate /etc/letsencrypt/live/peakkineticspt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/peakkineticspt.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://peakkineticspt.com$request_uri;
}
EOFSSL

        # Test and reload Nginx
        sudo nginx -t && sudo systemctl reload nginx

        # Set up auto-renewal
        echo "⏰ Setting up certificate auto-renewal..."
        sudo systemctl enable certbot.timer
        sudo systemctl start certbot.timer

        # Test renewal
        echo "🧪 Testing certificate renewal..."
        sudo certbot renew --dry-run

        echo ""
        echo "✅ SSL setup complete with auto-renewal!"
    else
        echo ""
        echo "❌ SSL certificate setup failed!"
        echo "You can try again manually later with:"
        echo "sudo certbot --nginx -d peakkineticspt.com -d www.peakkineticspt.com ..."
    fi
else
    echo ""
    echo "⏭️  Skipping SSL setup for now."
    echo ""
    echo "To set up SSL later, run:"
    echo "sudo certbot --nginx -d peakkineticspt.com -d www.peakkineticspt.com -d peakkineticspt.net -d www.peakkineticspt.net -d peakkineticspt.store -d www.peakkineticspt.store -d peakkineticspt.shop -d www.peakkineticspt.shop -d peakkineticspt.info -d www.peakkineticspt.info --redirect"
fi

# Test Docker
echo ""
echo "🐳 Testing Docker..."
docker compose version

# Test Java
echo "☕ Testing Java..."
java -version

echo ""
echo "==================================="
echo "✅ VM SETUP COMPLETE!"
echo "==================================="
echo ""
echo "Services Status:"
echo "  - Nginx: $(sudo systemctl is-active nginx)"
echo "  - Docker: $(sudo systemctl is-active docker)"
echo ""
echo "Next Steps:"
echo "==================================="
echo ""
echo "1. ✅ Nginx is configured and running"
if [ "$ssl_ready" = "yes" ]; then
    echo "2. ✅ SSL certificates are installed and will auto-renew"
    echo ""
    echo "Your application will be available at:"
    echo "  - https://peakkineticspt.com"
    echo "  - https://peakkineticspt.net (redirects to .com)"
    echo "  - https://peakkineticspt.store (redirects to .com)"
    echo "  - https://peakkineticspt.shop (redirects to .com)"
else
    echo "2. ⚠️  SSL certificates NOT set up yet"
    echo "   Run certbot manually when DNS is ready"
    echo ""
    echo "Your application will be available at:"
    echo "  - http://peakkineticspt.com (HTTP only for now)"
fi
echo ""
echo "3. Configure GitHub Secrets:"
echo "   - GCP_VM_SSH_KEY (your private key)"
echo "   - GCP_VM_USER (peakkineticspt)"
echo "   - GCP_PROJECT_ID"
echo ""
echo "4. Ensure Google Cloud firewall allows:"
echo "   - Port 80 (HTTP)"
echo "   - Port 443 (HTTPS)"
echo "   - Port 22 (SSH)"
echo ""
echo "5. Push to main/master to deploy your application"
echo ""
echo "==================================="