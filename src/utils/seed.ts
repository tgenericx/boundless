import { PrismaClient, Role } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'hammedanuoluwapopelumi@gmail.com';
  const password = 'S£curePa55';
  const hashedPassword = await argon.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      roles: [Role.ADMIN],
    },
  });

  console.log('✅ Admin seeded:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
