#!/bin/bash

# Script to upload secrets from a .env file to GitHub Repository Secrets
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

# Default .env file path
ENV_FILE=".env"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -f|--file) ENV_FILE="$2"; shift ;;
        -h|--help) 
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -f, --file FILE    Path to the .env file (default: .env)"
            echo "  -h, --help         Display this help message"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: File '$ENV_FILE' not found."
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

echo "🚀 Uploading secrets from '$ENV_FILE' to GitHub..."

# Read .env file line by line
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    if [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]]; then
        continue
    fi
    
    # Trim whitespace from key and value
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [ -n "$key" ] && [ -n "$value" ]; then
        echo "Setting secret: $key"
        echo "$value" | gh secret set "$key"
    fi
done < "$ENV_FILE"

echo "✅ All secrets from '$ENV_FILE' have been uploaded successfully!"
