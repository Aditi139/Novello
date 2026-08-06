# 📚 Novello — Online Bookstore System

A **modern microservices-based online bookstore** built with Spring Boot, React, Docker, and **Razorpay payment gateway**.

## 🏗️ Architecture

```
React Frontend (port 3000)
        ↓
API Gateway (port 8090)
        ↓
┌──────────┬───────────┬─────────┬───────────┬───────────┬──────────────┬──────────────┐
│  User    │  Catalog  │  Order  │  Payment  │ Inventory │    eBook     │Notification  │
│  8081    │  8082     │  8083   │  8084     │  8085     │  8086      │   8087       │
└──────────┴───────────┴─────────┴───────────┴───────────┴──────────────┴──────────────┘
        ↓
MySQL (3306) + Redis (6379)
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-org/novello.git
cd novello
```

### 2. Set up Razorpay (FREE test account)
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) and create a free account
2. Go to **Settings → API Keys** → Generate Test Key
3. Copy your **Key ID** and **Key Secret**

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and add your Razorpay keys:
# RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Build and run with Docker Compose
```bash
# Build all images (takes 5-10 minutes first time)
docker-compose up --build

# Or run in background:
docker-compose up --build -d
```

### 5. Access the application
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔌 API Gateway | http://localhost:8090 |
| 👤 User Service | http://localhost:8081 |
| 📚 Catalog | http://localhost:8082 |
| 🛒 Orders | http://localhost:8083 |
| 💳 Payments | http://localhost:8084 |
| 📦 Inventory | http://localhost:8085 |
| 📱 eBooks | http://localhost:8086 |
| 🔔 Notifications | http://localhost:8087 |

### 6. Default admin account
After starting, register any account OR use the seeded admin:
- **Email:** admin@novello.com
- **Password:** admin123

> **Note:** To create the admin user, call POST `/api/auth/register` with role ADMIN, or manually update the DB:
> ```sql
> UPDATE novello_users.users SET role = 'ADMIN' WHERE email = 'your@email.com';
> ```

## 💳 Payment Flow (Razorpay)

1. Add books to cart
2. Proceed to checkout
3. Enter shipping address
4. Click **"Pay Now"** → Razorpay modal opens
5. Use test card: `4111 1111 1111 1111`, CVV: `123`, Expiry: any future date
6. Or use test UPI: `success@razorpay`
7. Payment verified server-side → Order confirmed!

## 🧪 Running Tests

```bash
# Test individual service
cd user-service && mvn test

# Run all backend tests
for svc in user-service catalog-service order-service; do
  cd $svc && mvn test && cd ..
done
```

## 🔧 Development (without Docker)

### Backend (each service)
```bash
cd user-service
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
novello/
├── frontend/           # React + Vite frontend
├── api-gateway/        # Spring Cloud Gateway
├── user-service/       # Authentication & users
├── catalog-service/    # Books & categories
├── order-service/      # Cart & orders
├── payment-service/    # Razorpay integration
├── inventory-service/  # Stock management
├── ebook-service/      # PDF uploads & downloads
├── notification-service/ # In-app notifications
├── db-init/           # MySQL initialization scripts
├── docker-compose.yml
├── Jenkinsfile        # Jenkins CD pipeline
└── .github/workflows/ # GitHub Actions CI
```

## 🏗️ CI/CD Pipeline

### GitHub Actions (CI)
- Triggers on push to `main` and `develop`
- Builds all 8 Spring Boot services in parallel
- Runs unit tests
- Builds frontend
- Pushes Docker images to GitHub Container Registry

### Jenkins (CD)
- Full pipeline: checkout → build → test → package → Docker → deploy
- Health checks after deployment
- Configure `Jenkinsfile` with your registry and credentials

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | Spring Boot 3.2 + Java 17 |
| Build | Maven 3.9 |
| Database | MySQL 8.0 |
| Cache | Redis 7 |
| Payments | **Razorpay** |
| Container | Docker + Docker Compose |
| CI | GitHub Actions |
| CD | Jenkins |
| API Gateway | Spring Cloud Gateway |
| Auth | JWT (jjwt) |
| Styling | Vanilla CSS (custom design system) |

## 🔒 Security

- JWT-based authentication with 24-hour token expiry
- Razorpay HMAC-SHA256 signature verification (server-side)
- BCrypt password hashing
- CORS configured for development (tighten for production)
- Role-based access control (ADMIN / CUSTOMER)

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT

### Books
- `GET /api/books` — List all books (paginated)
- `GET /api/books/{id}` — Get book details
- `GET /api/books/search?keyword=` — Search books
- `GET /api/books/featured` — Featured books

### Orders
- `POST /api/orders` — Create order
- `GET /api/orders/user/{userId}` — Get user's orders

### Payments
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify payment signature

---


