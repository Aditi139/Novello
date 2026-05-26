# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject the production API Gateway URL at build time.
# Set VITE_API_URL as a Build Variable in the Railway frontend service.
# e.g. https://novello-api-gateway.up.railway.app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Place config in /etc/nginx/templates/ — the official nginx:alpine image
# automatically runs `envsubst` on every *.template file in this directory
# at container startup, outputting to /etc/nginx/conf.d/.
# This lets us use ${PORT} in nginx.conf so Railway's dynamic port is honoured.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default port for local Docker Compose (Railway overrides via $PORT env var)
EXPOSE 80
ENV PORT=80

CMD ["nginx", "-g", "daemon off;"]