# POS Desktop Pro

A modern, high-performance, and feature-rich Point of Sale (POS) desktop application built with Java 21 (Spring Boot 3), React 18, TypeScript, Tailwind CSS, and Electron.

---

## 🎯 Project Overview

**POS Desktop Pro** is an enterprise-grade point-of-sale application designed for small and medium businesses to manage sales transactions, inventory movements, customer relations, cash shift arqueos, payroll/expenses, business reports, and data backups.

### Key Features
- **100% Offline Capability**: Local client-server architecture with standalone desktop executable (.exe).
- **Cash Shift Control & Arqueo**: Strict sales validation requiring open cash shifts, initial base input, automated cash balance calculation (`Expected = Initial Base + Cash Sales - Expenses`), and count variance reporting.
- **Grouped Sales & Invoice Traceability**: View itemized transaction receipts with breakdown of subtotal, tax, payment method, seller, and customer.
- **Advanced Filtering Across All Modules**: Search by text, date ranges, categories, and stock/user statuses across Products, Inventory, Customers, Shifts, and Expenses.
- **Operational Expense Management**: Log payroll advances/salaries and raw material purchases directly against active cash shift balances.
- **Business Intelligence & Analytics**: Interactive dashboards for sales, net profit margins, top-selling products, and inventory valuation.
- **Data Backups & CSV Export**: Export full database backups in JSON or readable `.csv` format (openable in Microsoft Excel / Google Sheets).
- **User Friendly Error Handling**: Clean Spanish error notifications capturing HTTP status codes (400, 401, 403, 409, 500) without exposing technical stack traces.

---

## 🛠️ Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3.x**
- **Spring Security** (JWT Authentication & BCrypt)
- **Spring Data JPA** / Hibernate
- **PostgreSQL**
- **Flyway** (Database migrations)
- **Lombok** & **MapStruct**
- **Swagger / OpenAPI 3**

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS** (Slate Dark Mode UI)
- **React Router DOM**
- **Lucide React** & **Axios**

### Desktop & DevOps
- **Electron**
- **Git** & **GitHub Actions** (CI/CD Pipeline)

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Java 21 JDK
- Node.js (v18 or higher) & npm
- PostgreSQL Database

### 1. Backend Setup (Spring Boot)
```bash
cd backend
# Run database migrations and start server
./gradlew bootRun
```
The backend server will run on `http://localhost:8080/api/v1`.

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will launch on `http://localhost:5173`.

### 3. Desktop Release (Electron)
```bash
cd desktop
npm install
npm run start
```

---

## 📁 Project Structure

```
posSYSTEM/
├── backend/       # Spring Boot application (Controllers, Services, Repositories, Migrations)
├── frontend/      # React + TypeScript SPA (Components, Pages, Services, Formatters)
├── desktop/       # Electron wrapper & native executable config
├── database/      # Database SQL scripts
├── docs/          # Product backlog & sprint documentation
├── LICENSE        # MIT License
└── README.md      # Main documentation
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jhoan Sebastian Fernandez**  
*Systems Engineering*  
*Universidad del Valle*