import {
  PrismaClient,
  Role,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(
    "12345678",
    10,
  );

  // Create or find the Stream Nepal organization
  const organization =
    await prisma.organization.upsert({
      where: {
        slug: "stream-nepal",
      },
      update: {
        name: "Stream Nepal",
      },
      create: {
        name: "Stream Nepal",
        slug: "stream-nepal",
      },
    });

  console.log(
    "✅ Stream Nepal organization ready",
  );

  // Find existing owner
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: "sadab@example.com",
      },
    });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Sadab Ahmad",
        email: "sadab@example.com",
        password,
        role: Role.OWNER,
        organizationId: organization.id,
      },
    });

    console.log(
      "✅ Owner account created and assigned to Stream Nepal",
    );
  } else {
    // Attach existing user to Stream Nepal
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        organizationId: organization.id,
        role: Role.OWNER,
      },
    });

    console.log(
      "✅ Existing owner assigned to Stream Nepal",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });