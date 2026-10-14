# Resource Reservation Management System (RRMS)

> A full stack, enterprise grade Resource Reservation Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Neon Cloud PostgreSQL**. Features Role Based Access Control (RBAC), real time availability validation, and a modern dark glassmorphism UI.

---

##  Key Features

*** Role Based Access Control (RBAC):** Distinct dashboards and access rules for **Admins** (resource management, request approvals, system analytics) and **Employees** (booking submission, schedule tracking, reservation history).
* **Dark Glassmorphism UI:** Built with dark theme design tokens, translucent card components, backdrop blur utilities, and smooth motion transitions.
* **Double-Booking Prevention:** Server side validation routines check time slot overlaps and resource constraints before confirming reservations.
* **Status & Analytics Tracking:** Interactive monitoring for pending, approved, rejected, and cancelled resource bookings.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom Glassmorphism Utilities) |
| **Database** | [PostgreSQL](https://postgresql.org/) (Hosted on [Neon](https://neon.tech/)) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) |
| **Icons & Motion** | Lucide React, Framer Motion |

---

##  Local Development Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.x or higher)
* [npm](https://www.npmjs.com/) or `pnpm`
* A [Neon PostgreSQL](https://neon.tech/) database instance

### 1. Clone the Repository

```bash
git clone [https://github.com/Thashila2000/resource_reservation_system.git](https://github.com/Thashila2000/resource_reservation_system.git)
cd resource_reservation_system

```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

# Edit .env with your actual database URL and secrets
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"


### 4. Generate Prisma Client & Migrate

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```

