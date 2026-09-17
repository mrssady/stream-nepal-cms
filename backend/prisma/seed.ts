import {
  PrismaClient,
  Role,
  TournamentGame,
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

  // Default scoring rules (configurable per tournament)
  const pubgRule = await prisma.scoringRule.upsert({
    where: {
      id: "rule_pubg_default",
    },
    update: {
      name: "PUBG Mobile Standard",
      game: TournamentGame.PUBG_MOBILE,
      killPoint: 1,
      placementPoints: {
        "1": 12,
        "2": 10,
        "3": 8,
        "4": 6,
        "5": 5,
        "6": 4,
        "7": 3,
        "8": 2,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
      },
      booyahBonus: 0,
      penaltyPoints: 0,
      tiebreakers: [
        "points",
        "killPoints",
        "placementPoints",
        "kills",
        "bestPlacement",
      ],
      isDefault: true,
      organizationId: organization.id,
    },
    create: {
      id: "rule_pubg_default",
      name: "PUBG Mobile Standard",
      game: TournamentGame.PUBG_MOBILE,
      killPoint: 1,
      placementPoints: {
        "1": 12,
        "2": 10,
        "3": 8,
        "4": 6,
        "5": 5,
        "6": 4,
        "7": 3,
        "8": 2,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
      },
      booyahBonus: 0,
      penaltyPoints: 0,
      tiebreakers: [
        "points",
        "killPoints",
        "placementPoints",
        "kills",
        "bestPlacement",
      ],
      isDefault: true,
      organizationId: organization.id,
    },
  });

  const freeFireRule = await prisma.scoringRule.upsert({
    where: {
      id: "rule_free_fire_default",
    },
    update: {
      name: "Free Fire Standard",
      game: TournamentGame.FREE_FIRE,
      killPoint: 1,
      placementPoints: {
        "1": 10,
        "2": 8,
        "3": 6,
        "4": 4,
        "5": 3,
        "6": 2,
        "7": 1,
        "8": 1,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
      },
      booyahBonus: 2,
      penaltyPoints: 0,
      tiebreakers: [
        "points",
        "killPoints",
        "placementPoints",
        "kills",
        "bestPlacement",
      ],
      isDefault: true,
      organizationId: organization.id,
    },
    create: {
      id: "rule_free_fire_default",
      name: "Free Fire Standard",
      game: TournamentGame.FREE_FIRE,
      killPoint: 1,
      placementPoints: {
        "1": 10,
        "2": 8,
        "3": 6,
        "4": 4,
        "5": 3,
        "6": 2,
        "7": 1,
        "8": 1,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
      },
      booyahBonus: 2,
      penaltyPoints: 0,
      tiebreakers: [
        "points",
        "killPoints",
        "placementPoints",
        "kills",
        "bestPlacement",
      ],
      isDefault: true,
      organizationId: organization.id,
    },
  });

  console.log(
    "✅ Default scoring rules ready (PUBG + Free Fire)",
  );

  if (pubgRule && freeFireRule) {
    console.log("✅ Scoring rules upserted");
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