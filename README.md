# POS Desktop Pro

A modern, high-performance Point of Sale (POS) desktop application built with Java 21, Spring Boot, React, TypeScript, and Electron.

---

## 🎯 Project Overview

**POS Desktop Pro** is a robust desktop application designed for small and medium-sized businesses to streamline sales, inventory, customers, and business analytics.

### Key Features
- **100% Offline Capability**: Runs entirely locally with local client-server architecture.
- **Standalone Desktop App**: Self-contained executable (.exe) built using Electron.
- **Relational Database**: Powered by PostgreSQL with Flyway database migrations.
- **Business Intelligence & Analytics**: Interactive dashboards for sales, revenue, profit margins, and inventory valuation.
- **Optional AI Assistant**: AI integration via OpenAI for smart sales summaries and recommendations.

---

## 🛠️ Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3**
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
- **TailwindCSS**
- **React Router**
- **Axios**

### Desktop & DevOps
- **Electron**
- **Git** & **GitHub Actions** (CI/CD Automated Testing & Build Pipeline)

---

## 📐 System Architecture

```
+-------------------------------------------------------+
|                    Electron App                       |
|  +-------------------------------------------------+  |
|  |                 React + Vite UI                 |  |
|  +------------------------+------------------------+  |
+---------------------------|---------------------------+
                            | HTTP / REST API (JWT)
                            v
+-------------------------------------------------------+
|               Spring Boot Backend (v1)                |
|  +-------------------------------------------------+  |
|  |  Controllers -> Services -> JPA Repositories    |  |
|  +------------------------+------------------------+  |
+---------------------------|---------------------------+
                            | JDBC
                            v
+-------------------------------------------------------+
|                 PostgreSQL Database                   |
+-------------------------------------------------------+
```

---

## 📁 Project Structure

```
posSYSTEM/
├── backend/       # Spring Boot application (Controllers, Services, Repositories, Migrations)
├── frontend/      # React + TypeScript SPA (Components, Views, Services, Tailwind)
├── desktop/       # Electron wrapper & native integrations
├── database/      # Database scripts and schemas
├── docs/          # Sprint planning, UML diagrams, and product backlog
└── README.md      # Documentation
```

---

## 📊 Project Status & Roadmap

- [x] **Sprint 0 — Planning**: Backlog, Architecture, ERD, UML, and API Design.
- [x] **Sprint 1 — Infrastructure**: Spring Boot, React, Electron, Docker, PostgreSQL, and CI pipeline.
- [x] **Sprint 2 — Security**: User & Role CRUD, JWT Authentication, Spring Security, Login view.
- [x] **Sprint 3 — Catalogs**: Product & Category management, image upload, filters, min stock.
- [x] **Sprint 4 — Point of Sale (POS)**: Core sales module, instant product search, cart, checkout.
- [x] **Sprint 5 — Inventory**: Stock movements (IN/OUT/ADJUSTMENT), movement history, alerts.
- [x] **Sprint 6 — Customers**: Customer CRUD, sale association, history, and total spending metrics.
- [x] **Sprint 7 — Reports & Statistics**:
  - ✔ **Financial Reports**: Daily, Weekly, Monthly, and Yearly revenue & net profit summaries.
  - ✔ **Analytics**: Summary KPI cards, profit margins, average ticket, revenue growth.
  - ✔ **Best-Sellers**: Top 5 best-selling products by quantity and revenue.
  - ✔ **Inventory Valuation**: Category stock value distribution and low-stock alerts.
  - ✔ **Interactive Charts**: Responsive time-series charts for revenue vs net profit.
- [ ] **Sprint 8 — Settings**: Store profile, invoice customization, DB backup & restore.
- [ ] **Sprint 9 — AI Assistant**: Optional smart chat, sales insights, and recommendations.
- [ ] **Sprint 10 — Quality**: End-to-end testing, coverage enhancement, refactoring.
- [ ] **Sprint 11 — Desktop Release**: Executable build (.exe), installer, user guide.
- [ ] **Sprint 12 — Release 1.0**: Final bug fixes, polish, and production release.

---

## 👨‍💻 Author

**Jhoan Sebastian Fernandez**  
*Systems Engineering*  
*Universidad del Valle*