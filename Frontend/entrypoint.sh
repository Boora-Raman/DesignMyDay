#!/bin/sh
set -e

# Perform any initialization tasks (e.g., substitute environment variables)
# Example: Replace placeholders in default.conf if needed
# sed -i "s|{{VARIABLE}}|$VARIABLE|g" /etc/nginx/conf.d/default.conf

# Test Nginx configuration
nginx -t

# Start Nginx in the foreground
exec nginx -g "daemon off;"