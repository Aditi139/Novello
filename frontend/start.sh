#!/bin/sh
# Railway injects PORT at container start. This script substitutes ${PORT}
# into the nginx config template before starting nginx.
# Falls back to 80 if PORT is not set (local Docker Compose).
export PORT="${PORT:-80}"
echo "Starting nginx on port $PORT"
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
