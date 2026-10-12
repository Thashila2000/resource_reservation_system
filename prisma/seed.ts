import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding PrimeWave Lab resources...");

  // 1. Create default admin if not exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@primewave.com" },
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@primewave.com",
        password: adminPassword,
        role: "ADMIN",
        department: "Facility & IT",
      },
    });
    console.log("Created default Admin: admin@primewave.com / admin123");
  }

  // 2. Check if resources exist
  const resourceCount = await prisma.resource.count();
  if (resourceCount === 0) {
    await prisma.resource.createMany({
      data: [
        {
          name: "Quantum Boardroom (Room 401)",
          category: "Conference Room",
          description: "High-capacity executive boardroom with 4K telepresence display and whiteboards.",
          capacity: 16,
          location: "Building A, 4th Floor",
          isAvailable: true,
        },
        {
          name: "Photonics Collaboration Room (Room 204)",
          category: "Conference Room",
          description: "Mid-sized collaborative space equipped with dual monitors and video conferencing.",
          capacity: 8,
          location: "Building A, 2nd Floor",
          isAvailable: true,
        },
        {
          name: "Rigol 4-Channel Digital Oscilloscope",
          category: "Lab Hardware",
          description: "350 MHz bandwidth, 8 GSa/s real-time sampling rate, protocol decoder included.",
          capacity: 1,
          location: "Hardware Lab B, Bench 4",
          isAvailable: true,
        },
        {
          name: "Spectrum Analyzer (Anritsu MS2090A)",
          category: "Lab Hardware",
          description: "Field master pro real-time spectrum analyzer covering up to 54 GHz.",
          capacity: 1,
          location: "RF & Wireless Lab, Station 2",
          isAvailable: true,
        },
        {
          name: "PrimeWave Electric Transport Van",
          category: "Vehicle",
          description: "Zero-emission cargo transit vehicle for inter-lab equipment transfers.",
          capacity: 3,
          location: "East Parking Bay #12",
          isAvailable: true,
        },
      ],
    });
    console.log("Seeded 5 initial PrimeWave resources.");
  } else {
    console.log(`Resources already present (${resourceCount} found).`);
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
