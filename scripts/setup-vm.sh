#!/bin/bash
# Run this script on your GCP VM to set up the environment

set -e

echo "🚀 Setting up Peak Kinetics VM..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
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

# Create deployment directory
echo "📁 Creating deployment directories..."
mkdir -p ~/deployment/backend/target
mkdir -p ~/deployment/uploads/blog/images
mkdir -p ~/.config/systemd/user

# Create log directory
sudo mkdir -p /var/log/peakkinetics
sudo chown $USER:$USER /var/log/peakkinetics

# Set up systemd service (optional - if you want to use systemd)
echo "⚙️  You can optionally set up systemd service for auto-restart"
echo "Copy the peakkinetics.service file to /etc/systemd/system/"
echo "Then run: sudo systemctl enable peakkinetics && sudo systemctl start peakkinetics"

# Test Docker
echo "🐳 Testing Docker..."
docker compose version

# Test Java
echo "☕ Testing Java..."
java -version

echo ""
echo "✅ VM setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your GitHub Actions SSH public key to ~/.ssh/authorized_keys"
echo "2. Set up GitHub Secrets: GCP_VM_SSH_KEY, GCP_VM_USER"
echo "3. Open firewall ports in Google Cloud Console:"
echo "   - Port 8080 (Spring Boot application)"
echo "   - Port 3000 (Grafana dashboard)"
echo "   - Port 4317 (OTLP gRPC - optional)"
echo "   - Port 4318 (OTLP HTTP - optional)"
echo "4. Push to main/master branch to trigger deployment"
echo ""
echo "Your application will be available at:"
echo "  - Application: http://$(curl -s ifconfig.me):8080"
echo "  - Grafana: http://$(curl -s ifconfig.me):3000"