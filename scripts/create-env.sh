#!/bin/bash

# Create a .env file from environment variables or a template
# This script is useful for CI/CD environments like GitHub Actions

# Exit on error
set -e

# Path for the .env file
ENV_FILE="./.env"

# Check if .env.example exists
if [ ! -f "env.example" ]; then
  echo "env.example not found!"
  exit 1
fi

# Copy example file to .env
cp env.example "$ENV_FILE"

echo ".env file created from env.example"

# Replace placeholders with environment variables if they are set
# Note: The | character in the sed command is used as a delimiter to handle special characters in values
sed -i.bak "s|DB_HOST=.*|DB_HOST=${DB_HOST:-your_db_host_here}|" "$ENV_FILE"
sed -i.bak "s|DB_PORT=.*|DB_PORT=${DB_PORT:-3306}|" "$ENV_FILE"
sed -i.bak "s|DB_USER=.*|DB_USER=${DB_USER:-your_db_user_here}|" "$ENV_FILE"
sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-your_db_password_here}|" "$ENV_FILE"
sed -i.bak "s|DB_NAME=.*|DB_NAME=${DB_NAME:-your_db_name_here}|" "$ENV_FILE"
sed -i.bak "s|CLAUDE_API_KEY=.*|CLAUDE_API_KEY=${CLAUDE_API_KEY:-your_claude_api_key_here}|" "$ENV_FILE"
sed -i.bak "s|PORT=.*|PORT=${PORT:-5001}|" "$ENV_FILE"
sed -i.bak "s|NODE_ENV=.*|NODE_ENV=${NODE_ENV:-development}|" "$ENV_FILE"

# Remove the backup file created by sed
rm -f "${ENV_FILE}.bak"

echo ".env file has been configured." 