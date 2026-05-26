# 🚀 Railway Deployment Guide — Novello

Step-by-step guide to deploy all Novello microservices on Railway.

---

## Prerequisites

- [Railway account](https://railway.app) (Hobby plan — $5/month, includes $5 credit)
- GitHub repo connected: `https://github.com/Aditi139/Novello`
- Razorpay test keys (already in `.env`)

---

## Step 1 — Create Railway Project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **"Empty Project"** (we'll add services manually)
3. Name it: `Novello`

---

## Step 2 — Deploy MySQL

1. Click **"+ New Service"** → **"Docker Image"**
2. Image: `mysql:8.0`
3. Service name: `mysql`
4. Go to **Variables** tab and add:

```
MYSQL_ROOT_PASSWORD  = novello_root_2024
MYSQL_USER           = novello
MYSQL_PASSWORD       = novello_pass_2024
MYSQL_DATABASE       = novello_init
```

5. Go to **Settings** → **Networking** → Generate a **Private Domain** (auto-assigned)
6. Note: Tables are created automatically by Spring Boot (`ddl-auto=update`) — no manual SQL needed ✅

---

## Step 3 — Deploy Redis

1. Click **"+ New Service"** → **"Docker Image"**
2. Image: `redis:7-alpine`
3. Service name: `redis`
4. No extra environment variables needed
5. Railway auto-assigns private domain `redis.railway.internal`

---

## Step 4 — Deploy Spring Boot Microservices

For **each** of the 7 services below, repeat these steps:

1. Click **"+ New Service"** → **"GitHub Repo"** → select `Aditi139/Novello`
2. In **Settings** → **Source** → set **Root Directory** to the service folder (e.g. `user-service`)
3. Railway auto-detects the `Dockerfile` and `railway.toml`
4. Set the **Service Name** exactly as shown in the table below
5. Add environment variables from the table below
6. Click **Deploy**

### Service Name Map

| Service Name (exact) | Root Directory | Port |
|---|---|---|
| `user-service` | `user-service` | 8081 |
| `catalog-service` | `catalog-service` | 8082 |
| `order-service` | `order-service` | 8083 |
| `payment-service` | `payment-service` | 8084 |
| `inventory-service` | `inventory-service` | 8085 |
| `ebook-service` | `ebook-service` | 8086 |
| `notification-service` | `notification-service` | 8087 |

---

## Step 5 — Environment Variables Per Service

> **Railway Variable References**: Use `${{service-name.RAILWAY_PRIVATE_DOMAIN}}` to reference
> another service's private hostname. Railway resolves these automatically.

> **PORT vs SERVER_PORT**: Railway automatically injects a `PORT` env var into every container
> and uses it for healthchecks. All Spring Boot services are configured to read `$PORT` first
> (via `server.port=${PORT:${SERVER_PORT:808X}}`), so **do NOT set `PORT` manually** —
> Railway manages it. `SERVER_PORT` is only used as a local-dev fallback.

> **Inter-service URLs**: The port numbers in `*_SERVICE_URL` values (`:8081`, `:8082`, etc.)
> must match the `SERVER_PORT` you set. Railway's private networking uses these ports directly.

---

### `user-service`

```
SERVER_PORT                 = 8081
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_users?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
JWT_SECRET                  = NovelloSuperSecretJwtKey2024ForAuthenticationAndAuthorization
JWT_EXPIRATION              = 86400000
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `catalog-service`

```
SERVER_PORT                 = 8082
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_catalog?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
SPRING_REDIS_HOST           = ${{redis.RAILWAY_PRIVATE_DOMAIN}}
SPRING_REDIS_PORT           = 6379
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `order-service`

```
SERVER_PORT                 = 8083
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_orders?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
SPRING_REDIS_HOST           = ${{redis.RAILWAY_PRIVATE_DOMAIN}}
SPRING_REDIS_PORT           = 6379
CATALOG_SERVICE_URL         = http://${{catalog-service.RAILWAY_PRIVATE_DOMAIN}}:8082
INVENTORY_SERVICE_URL       = http://${{inventory-service.RAILWAY_PRIVATE_DOMAIN}}:8085
NOTIFICATION_SERVICE_URL    = http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:8087
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `payment-service`

```
SERVER_PORT                 = 8084
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_payments?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
RAZORPAY_KEY_ID             = rzp_test_StVhLsAw26eEYP
RAZORPAY_KEY_SECRET         = Q1LNDOxPweTFtEzAuWsbJA81
ORDER_SERVICE_URL           = http://${{order-service.RAILWAY_PRIVATE_DOMAIN}}:8083
NOTIFICATION_SERVICE_URL    = http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:8087
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `inventory-service`

```
SERVER_PORT                 = 8085
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_inventory?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `ebook-service`

```
SERVER_PORT                 = 8086
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_ebooks?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
EBOOK_UPLOAD_DIR            = /app/uploads
ORDER_SERVICE_URL           = http://${{order-service.RAILWAY_PRIVATE_DOMAIN}}:8083
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

### `notification-service`

```
SERVER_PORT                 = 8087
SPRING_DATASOURCE_URL       = jdbc:mysql://${{mysql.RAILWAY_PRIVATE_DOMAIN}}:3306/novello_notifications?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME  = novello
SPRING_DATASOURCE_PASSWORD  = novello_pass_2024
JAVA_OPTS                   = -Xmx256m -Xss512k
```

---

## Step 6 — Deploy API Gateway

1. Click **"+ New Service"** → **"GitHub Repo"** → `Aditi139/Novello`
2. Root Directory: `api-gateway`
3. Service Name: `api-gateway`
4. Add environment variables:

```
SERVER_PORT               = 8080
JWT_SECRET                = NovelloSuperSecretJwtKey2024ForAuthenticationAndAuthorization
JWT_EXPIRATION            = 86400000
SPRING_REDIS_HOST         = ${{redis.RAILWAY_PRIVATE_DOMAIN}}
SPRING_REDIS_PORT         = 6379
USER_SERVICE_URL          = http://${{user-service.RAILWAY_PRIVATE_DOMAIN}}:8081
CATALOG_SERVICE_URL       = http://${{catalog-service.RAILWAY_PRIVATE_DOMAIN}}:8082
ORDER_SERVICE_URL         = http://${{order-service.RAILWAY_PRIVATE_DOMAIN}}:8083
PAYMENT_SERVICE_URL       = http://${{payment-service.RAILWAY_PRIVATE_DOMAIN}}:8084
INVENTORY_SERVICE_URL     = http://${{inventory-service.RAILWAY_PRIVATE_DOMAIN}}:8085
EBOOK_SERVICE_URL         = http://${{ebook-service.RAILWAY_PRIVATE_DOMAIN}}:8086
NOTIFICATION_SERVICE_URL  = http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:8087
```

5. Go to **Settings** → **Networking** → **Generate Domain**
6. Note the public URL, e.g. `https://novello-api-gateway.up.railway.app`

---

## Step 7 — Deploy Frontend

1. Click **"+ New Service"** → **"GitHub Repo"** → `Aditi139/Novello`
2. Root Directory: `frontend`
3. Service Name: `frontend`
4. Go to **Variables** tab → add this **Build Variable**:

```
VITE_API_URL = https://novello-api-gateway.up.railway.app
```

> ⚠️ Replace `novello-api-gateway.up.railway.app` with your actual API Gateway public URL from Step 6.

5. Go to **Settings** → **Networking** → **Generate Domain**
6. Your frontend is now live! 🎉

---

## Step 8 — GitHub Actions Secrets

To enable the `railway-deploy.yml` workflow, add these secrets to your GitHub repo
(**Settings → Secrets → Actions → New repository secret**):

| Secret Name | Value |
|---|---|
| `RAILWAY_TOKEN` | Get from Railway → Account Settings → Tokens → New Token |
| `RAILWAY_API_GATEWAY_URL` | e.g. `https://novello-api-gateway.up.railway.app` |
| `RAILWAY_FRONTEND_URL` | e.g. `https://novello-frontend.up.railway.app` |

---

## Step 9 — Verify Everything Works

```bash
# 1. Check API Gateway health
curl https://novello-api-gateway.up.railway.app/actuator/health

# 2. Check books are loading (25 books seeded by catalog-service DataLoader)
curl https://novello-api-gateway.up.railway.app/api/books?page=0&size=5

# 3. Check categories
curl https://novello-api-gateway.up.railway.app/api/categories
```

Then visit your frontend URL and:
- ✅ Homepage loads with books
- ✅ Register / Login works
- ✅ Browse catalog
- ✅ Add to cart → checkout

---

## Architecture on Railway

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Railway Project                          │
│                                                              │
│  🌐 frontend (public HTTPS)                                  │
│       │ VITE_API_URL → calls API Gateway directly            │
│       ▼                                                      │
│  🌐 api-gateway (public HTTPS)  :8080                        │
│       │ routes via private .railway.internal network         │
│       ├── 👤 user-service          :8081                     │
│       ├── 📚 catalog-service       :8082                     │
│       ├── 📦 order-service         :8083                     │
│       ├── 💳 payment-service       :8084                     │
│       ├── 📊 inventory-service     :8085                     │
│       ├── 📱 ebook-service         :8086                     │
│       └── 🔔 notification-service  :8087                     │
│                │                                             │
│         ┌──────┴──────┐                                      │
│         ▼             ▼                                      │
│   🗄️ mysql:3306   ⚡ redis:6379   (private only)            │
└─────────────────────────────────────────────────────────────┘
```

Only **frontend** and **api-gateway** have public HTTPS URLs.
All other services communicate internally via `*.railway.internal` — never exposed to the internet.

---

## Cost Estimate (Hobby Plan — $5/month)

| Service | RAM | Est. Cost/month |
|---|---|---|
| MySQL | 512MB | ~$0.30 |
| Redis | 128MB | ~$0.08 |
| 7× Spring Boot | 7 × 384MB | ~$2.70 |
| Frontend (nginx) | 64MB | ~$0.04 |
| API Gateway | 384MB | ~$0.30 |
| **Total** | | **~$3.42/month** |

Well within the $5 included credit. ✅

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Healthcheck failure** | The service isn't listening on the port Railway expects. Ensure `server.port=${PORT:${SERVER_PORT:808X}}` is set in `application.properties`. Do **not** set `PORT` manually in Railway. |
| Spring Boot OOM on start | Add `JAVA_OPTS=-Xmx256m -Xss512k` to the service env vars |
| MySQL connection refused | Wait 2–3 min for MySQL to fully start, then redeploy the Spring Boot services |
| Frontend shows blank/CORS error | Make sure `VITE_API_URL` is set correctly and **rebuild** the frontend service |
| Redis connection error | Verify `SPRING_REDIS_HOST` uses the `${{redis.RAILWAY_PRIVATE_DOMAIN}}` reference |
| 502 Bad Gateway | The upstream Spring Boot service crashed — check its Railway logs |
| nginx healthcheck fails | The frontend Dockerfile puts `nginx.conf` in `/etc/nginx/templates/` — this auto-substitutes `${PORT}`. If using an old Dockerfile, update it. |
