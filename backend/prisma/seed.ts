import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('12345678', 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'sadab@example.com',
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: 'Sadab Ahmad',
        email: 'sadab@example.com',
        password,
        role: Role.OWNER,
      },
    });

    console.log('✅ Owner account created');
  } else {
    console.log('✅ Owner account already exists');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });