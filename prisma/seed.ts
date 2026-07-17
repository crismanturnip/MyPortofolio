import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requiredEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD", fallback: string) {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    return fallback;
  }

  throw new Error(`${name} wajib diatur sebelum seed admin di production.`);
}

async function main() {
  const email = requiredEnv("ADMIN_EMAIL", "dev-admin@example.com");
  const password = requiredEnv("ADMIN_PASSWORD", "DevAdmin123!");
  const hash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      name: "Crisman Admin"
    },
    create: {
      email,
      passwordHash: hash,
      name: "Crisman Admin"
    }
  });

  console.log(`Seed admin selesai: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
