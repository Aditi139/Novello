# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject the production API Gateway URL at build time.
# On Railway: set VITE_API_URL as a Build Variable in the frontend service.
# e.g. https://novello-api-gateway.up.railway.app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config as a template (PORT will be substituted at startup)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy and enable startup script that runs envsubst then launches nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Railway injects $PORT — our start.sh substitutes it into nginx config.
# ENV PORT=80 is the local Docker Compose fallback (Railway always overrides).
ENV PORT=80
EXPOSE 80

CMD ["/start.sh"]