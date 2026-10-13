# Resource Reservation Management System (RRMS)

> A full stack, enterprise grade Resource Reservation Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Neon Cloud PostgreSQL**. Features Role Based Access Control (RBAC), real time availability validation, and a modern dark glassmorphism UI.

---

##  Key Features

* ** Role Based Access Control (RBAC):** Distinct dashboards and access rules for **Admins** (resource management, request approvals, system analytics) and **Employees** (booking submission, schedule tracking, reservation history).
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

## 📁 Project Structure

├── app/
│   ├── (auth)/             # Login & Registration pages
│   ├── (dashboard)/        # Protected Admin & Employee dashboards
│   │   ├── admin/          # Resource inventory & approvals queue
│   │   └── employee/       # Resource catalog & personal bookings
│   ├── api/auth/           # NextAuth route handlers
│   └── globals.css         # Glassmorphism utilities & theme tokens
├── components/
│   ├── forms/              # Booking & Resource creation forms
│   ├── shared/             # Role based sidebar & dashboard shell
│   └── ui/                 # Reusable glass buttons, cards, and modal
├── lib/
│   ├── actions.ts          # Server Actions & conflict prevention logic
│   ├── auth.ts             # Authentication setup & session callbacks
│   └── prisma.ts           # Prisma client singleton (PostgreSQL)
├── prisma/
│   ├── schema.prisma       # Database models (User, Resource, Reservation)
│   └── seed.ts             # Demo data seed script
└── proxy.ts                # Next.js 16 RBAC route protection proxy


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