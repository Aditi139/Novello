# Novello — 📚 Microservices-Based Online Bookstore

A premium full-stack online bookstore platform built using **React ⚛️**, **Spring Boot Microservices ☕**, and **Docker 🐳**. Novello supports both **Hardcopy Books 📖** and **eBooks 📱** with modern UI, digital delivery, and scalable microservices architecture.

---

## ✨ Features

- 🎨 Modern premium bookstore UI
- 📚 Hardcopy + eBook purchasing
- ⚡ Instant digital eBook delivery
- 📦 Order management system
- 🔐 Secure authentication
- 🗂️ Category-based catalog browsing
- 📱 Fully responsive design
- 🧩 Microservices architecture
- 🐳 Dockerized deployment
- 🌐 API Gateway routing
- ⚡ Redis caching support
- 📖 Realistic book catalog system

---

## 🛠️ Tech Stack

### 🎨 Frontend
- React.js ⚛️
- Vite ⚡
- JavaScript 📜
- CSS 🎨
- Nginx 🌐

### ⚙️ Backend
- Spring Boot ☕
- Java Microservices 🧩
- REST APIs 🔗
- Maven 📦
- JWT Authentication 🔐

### 🗄️ Database & Cache
- MySQL 🐬
- Redis ⚡

### 🚀 DevOps & Deployment
- Docker 🐳
- Docker Compose 📦
- Railway ☁️ (Cloud Deployment)
- GitHub Actions 🔄 (CI/CD)
- Jenkins 🔄

---

## 🧩 Microservices

| Service | Purpose |
|---|---|
| 🌐 API Gateway | Central request routing |
| 👤 User Service | Authentication & users |
| 📚 Catalog Service | Books & categories |
| 📦 Order Service | Orders management |
| 📊 Inventory Service | Book stock handling |
| 📱 Ebook Service | eBook downloads |
| 🔔 Notification Service | Notifications & alerts |

---

## 📂 Project Structure

```
Novello/
│
├── 🌐 api-gateway/
├── 👤 user-service/
├── 📚 catalog-service/
├── 📦 order-service/
├── 📊 inventory-service/
├── 📱 ebook-service/
├── 🔔 notification-service/
├── 🎨 frontend/
├── 🗄️ db-init/
├── 🐳 docker-compose.yml
├── 🔄 Jenkinsfile
└── 📄 README.md
```

---

## ⚙️ Installation & Setup

### 📥 Clone Repository

```bash
git clone https://github.com/Aditi139/Novello.git
cd Novello
```

### ▶️ Run Complete Project

```bash
docker compose up --build
```

### ⏹️ Stop Project

```bash
docker compose down
```

### 🐳 Docker Containers

Check running containers:

```bash
docker ps
```

---

## ☁️ Railway Cloud Deployment

Novello is fully deployable on [Railway](https://railway.app) with auto-redeploy on every GitHub push.

### 🌐 Live URLs *(update after deployment)*

| Service | URL |
|---|---|
| 🎨 Frontend | `https://novello-frontend.up.railway.app` |
| 🌐 API Gateway | `https://novello-api-gateway.up.railway.app` |

### ⚡ Quick Deploy Verification

```bash
# Health check
curl https://novello-api-gateway.up.railway.app/actuator/health

# Books API
curl https://novello-api-gateway.up.railway.app/api/books?page=0&size=5
```

### 📋 Full Deployment Guide

See **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** for:
- Step-by-step Railway dashboard setup
- All environment variables per service
- GitHub Actions secrets configuration
- Cost estimates & troubleshooting

---

## 🔄 Jenkins CI/CD

This project includes Jenkins pipeline configuration using: `Jenkinsfile`

Pipeline supports:
- ✅ Automated builds
- 🐳 Docker image creation
- 🔄 CI/CD workflow
- 🚀 Microservices deployment

---

## 🌟 Highlights

- 🧩 Scalable Microservices Architecture
- 🎨 Premium Modern UI
- 🐳 Dockerized Full Stack Deployment
- ☁️ Railway Cloud Deployment
- 🔄 GitHub Actions CI/CD (auto-deploy on push)
- 📚 Realistic Book Catalog (25 books, 8 categories)
- 📱 Responsive & Interactive Frontend
- ⚡ Fast API Communication
- 🌐 API Gateway Based Architecture
