import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../src/app/generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaPg({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? Number(process.env.DATABASE_PORT)
      : undefined,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Platform Admin";

  if (!email || !password) {
    console.warn(
      "Skipping admin seed because ADMIN_EMAIL or ADMIN_PASSWORD is missing."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
