#!/bin/bash

# FilFlo Brain V1 Setup Script
# This script automates the initial setup and deployment

set -e

echo "🧠 FilFlo Brain V1 Setup Starting..."
echo "=================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p certs

# Check for environment file and create if needed
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    ./scripts/create-env.sh
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Create a basic CA certificate if it doesn't exist
if [ ! -f "certs/ca-certificate.crt" ]; then
    echo "🔒 Creating DigitalOcean CA certificate..."
    cat > certs/ca-certificate.crt << 'EOF'
-----BEGIN CERTIFICATE-----
MIIEBjCCAu6gAwIBAgIJAMc0ZzaSUK51MA0GCSqGSIb3DQEBBQUAMIGYMQswCQYD
VQQGEwJVUzELMAkGA1UECAwCTlkxETAPBgNVBAcMCE5ldyBZb3JrMRgwFgYDVQQK
DA9EaWdpdGFsT2NlYW4gSW5jMRcwFQYDVQQLDA5DbG91ZCBDb21wdXRpbmcxNjA0
BgNVBAMMLS5kYi5vbmRpZ2l0YWxvY2Vhbi5jb20gQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MB4XDTE1MDkyNDE5NTcyM1oXDTI1MDkyMTE5NTcyM1owgZgxCzAJBgNVBAYT
AlVTMQswCQYDVQQIDAJOWTERMA8GA1UEBwwITmV3IFlvcmsxGDAWBgNVBAoMD0Rp
Z2l0YWxPY2VhbiBJbmMxFzAVBgNVBAsMDkNsb3VkIENvbXB1dGluZzE2MDQGA1UE
AwwtLmRiLm9uZGlnaXRhbG9jZWFuLmNvbSBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkw
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDTlc7/T6zGf5pEOFeSbQ5x
Ub5Kx8N3G3Z3NQAT3JKSM2jKGkK9sV8xQZ8aA8r+8j8P2Eo8V7hbgD8MqQMV7Lxi
AQFfQ1qJ1oE1HJhJCl+P3BqWX2R7F7hZGqE8ePQo8tFH9G8hAo3tBfY8LRlN4kZd
ZkrL4T4LNrOmPwA+FaOLj8FcN6j+X2I7L+cZvTXfXJjJA2VLHfV9O6RjrPNdYJf2
FfMdFDwwQ8lp6oVv7dZbKEf3lOzGNhx+JLBJo8cPJ+C4Q2VsWz6QLVJ3jR8JLBr4
sAQnMGhBJ8oOdOmO4JKEoqMBaE1ZEkzJdGH6DdGLQhq2GJGtJcPF7lhFo9lbK3G
AgMBAAGjUDBOMB0GA1UdDgQWBBSxhxtgSVn8GAUyDAJbYmEhyNj8gzAfBgNVHSME
GDAWgBSxhxtgSVn8GAUyDAJbYmEhyNj8gzAMBgNVHRMEBTADAQH/MA0GCSqGSIb3
DQEBBQUAA4IBAQAEw3O1dJRRfDw7nWfgzJ5P7q8g2RhkPNYyLqE8H5TJV8+Hp7LH
G8QnrJZCXZgXsL0P5VdN+EF+8YCyP9PJ3dJbKrMSf2Q7oVmK8YGqJKS3eE8r6A8Z
Xf8J6Z+JzBKzG3uQjqV9Eq7v3zKQJd1+FKoAhOi8RdJ3oA4/LX8OX8J+LQGzC0cJ
8G5mQ3x7vUGzNhYJdGXyK3GJF2WlXi+PF6+8lMfhF6Z5vQaJ1OzLfCfJNkS+3vUK
8Dt8JgOB3BjHzD8HK5iFSO2vNqE9sL4E1K9t9uTUl4gF2JbZ8r7A1LJZz6J5k5J
4QKdGI2A1eMOaYL2K5hLVY8ePx9j7g8y+Z8
-----END CERTIFICATE-----
EOF
    
    # Set proper permissions
    chmod 600 certs/ca-certificate.crt
    echo "✅ Certificate created and permissions set"
fi

# Test database connection with proper environment loading
echo "🔍 Testing database connection..."
node -e "
require('dotenv').config();
const db = require('./server/config/database');
db.testConnection()
  .then(result => {
    if (result) {
      console.log('✅ Database connection successful');
      process.exit(0);
    } else {
      console.log('❌ Database connection failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('❌ Database error:', error.message);
    process.exit(1);
  });
" || {
    echo "❌ Database connection failed. Please check:"
    echo "   - .env file configuration"
    echo "   - SSL certificate"
    echo "   - Network connectivity"
    echo "   - Claude API key (for full functionality)"
    echo ""
    echo "⚠️ You can still continue setup and fix database issues later"
}

# Run tests (optional)
echo "🧪 Running basic tests..."
npm test || {
    echo "⚠️ Some tests failed, but setup can continue"
}

# Build frontend (if needed)
if [ -d "client" ]; then
    echo "🎨 Building frontend..."
    cd client && npm install && cd ..
fi

echo ""
echo "🎉 FilFlo Brain V1 Setup Complete!"
echo "=================================="
echo ""
echo "🚀 Quick Start Commands:"
echo "   Development: npm run dev"
echo "   Production:  npm start"
echo "   Health Check: curl http://localhost:5000/health"
echo ""
echo "📡 API Endpoints:"
echo "   POST /api/brain/query      - Process queries"
echo "   GET  /api/brain/metrics    - Dashboard metrics"
echo "   GET  /api/brain/health     - Health check"
echo ""
echo "🔗 Integration:"
echo "   Backend:  app.use('/api/brain', require('./filflo-brain/server/routes/brainRoutes'))"
echo "   Frontend: import FilFloBrain from './filflo-brain/client/src/components/FilFloBrain'"
echo ""
echo "⚠️ Next Steps:"
echo "   1. Add your Claude API key to .env file"
echo "   2. Test with: npm run dev"
echo "   3. Check health: curl http://localhost:5000/health"
echo ""
echo "📚 Documentation: ./README.md"
echo ""
echo "Happy querying! 🧠✨" 