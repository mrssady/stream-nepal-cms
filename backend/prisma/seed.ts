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

  // Demo organization for testing organization switching
  await prisma.organization.upsert({
    where: {
      slug: "demo-org",
    },
    update: {
      name: "Demo Org",
    },
    create: {
      name: "Demo Org",
      slug: "demo-org",
      logo: null,
    },
  });

  console.log(
    "✅ Demo organization ready (organization switching)",
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
      zoneCount: 8,
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
      zoneCount: 6,
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

  // Default OCR profiles (PUBG Mobile spectator 1920x1080 HUD layout)
  const stRois = [
    {
      name: "matchHeader",
      x: 0,
      y: 0,
      width: 300,
      height: 65,
      enabled: true,
      ocr: true,
      label: "Match header",
      purpose: "Remaining players + observed team count",
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
    },
    {
      name: "teamEliminations",
      x: 0,
      y: 45,
      width: 250,
      height: 35,
      enabled: true,
      ocr: true,
      label: "Team eliminations",
      purpose: "Informational elimination counter (not primary placement source)",
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
    },
    {
      name: "observerPlayerList",
      x: 0,
      y: 75,
      width: 260,
      height: 180,
      enabled: true,
      ocr: true,
      label: "Observer player list",
      purpose: "Currently observed team/player markers",
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 140, denoise: false },
    },
    {
      name: "killFeed",
      x: 0,
      y: 250,
      width: 500,
      height: 300,
      enabled: false,
      ocr: true,
      label: "Kill feed",
      purpose: "Kill/elimination events - disabled until confirmed on real footage",
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
    },
    {
      name: "minimap",
      x: 1740,
      y: 0,
      width: 180,
      height: 180,
      enabled: false,
      ocr: false,
      label: "Minimap",
      purpose: "Computer vision (markers / zone). Ignored for OCR MVP.",
      preprocessing: { scale: 1, grayscale: false, contrast: 1, threshold: 0, denoise: false },
    },
    {
      name: "zoneInfo",
      x: 1730,
      y: 145,
      width: 190,
      height: 90,
      enabled: true,
      ocr: true,
      label: "Zone / stage information",
      purpose: "Zone timer + stage number (optional match state)",
      preprocessing: { scale: 3, grayscale: true, contrast: 1.6, threshold: 140, denoise: false },
    },
    {
      name: "currentTeam",
      x: 580,
      y: 735,
      width: 380,
      height: 100,
      enabled: true,
      ocr: true,
      label: "Current observed team",
      purpose: 'Observer "Teams N" counter + current team tag (observerTeamsValue)',
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
    },
    {
      name: "playerStats",
      x: 950,
      y: 760,
      width: 300,
      height: 150,
      enabled: true,
      ocr: true,
      label: "Player statistics",
      purpose: "Eliminations / damage / assists of observed player",
      preprocessing: { scale: 2, grayscale: true, contrast: 1.5, threshold: 120, denoise: false },
    },
  ];

  const stConfig = {
    resolution: { width: 1920, height: 1080 },
    rois: Object.fromEntries(
      stRois.map((roi) => [roi.name, roi]),
    ),
    preprocessing: {},
  };

  const pubgOcrProfile = await prisma.ocrProfile.upsert({
    where: {
      id: "ocr_pubg_default",
    },
    update: {
      name: "PUBG Mobile Spectator HUD",
      game: TournamentGame.PUBG_MOBILE,
      width: 1920,
      height: 1080,
      config: stConfig,
      isDefault: true,
    },
    create: {
      id: "ocr_pubg_default",
      name: "PUBG Mobile Spectator HUD",
      game: TournamentGame.PUBG_MOBILE,
      width: 1920,
      height: 1080,
      config: stConfig,
      isDefault: true,
    },
  });

  const freeFireOcrProfile = await prisma.ocrProfile.upsert({
    where: {
      id: "ocr_free_fire_default",
    },
    update: {
      name: "Free Fire Production HUD",
      game: TournamentGame.FREE_FIRE,
      width: 1920,
      height: 1080,
      config: stConfig,
      isDefault: true,
    },
    create: {
      id: "ocr_free_fire_default",
      name: "Free Fire Production HUD",
      game: TournamentGame.FREE_FIRE,
      width: 1920,
      height: 1080,
      config: stConfig,
      isDefault: true,
    },
  });

  console.log(
    "✅ Default OCR profiles ready (PUBG + Free Fire)",
  );

  if (pubgOcrProfile && freeFireOcrProfile) {
    console.log("✅ OCR profiles upserted");
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