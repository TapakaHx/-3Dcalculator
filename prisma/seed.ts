import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settingsCount = await prisma.globalSettings.count();
  if (settingsCount === 0) {
    await prisma.globalSettings.create({
      data: {
        electricityUahPerKwh: 4.32,
        laborUahPerHour: 200
      }
    });
  }

  const printers = [
    {
      name: "Prusa MK3S+",
      powerWatts: 120,
      amortUahPerHour: 15,
      serviceUahPerHour: 5
    },
    {
      name: "Bambu Lab P1S",
      powerWatts: 80,
      amortUahPerHour: 20,
      serviceUahPerHour: 8
    }
  ];

  for (const printer of printers) {
    await prisma.printer.upsert({
      where: { name: printer.name },
      update: printer,
      create: printer
    });
  }

  const materials = [
    { name: "PLA", priceUahPerKg: 450, defaultWastePercent: 5 },
    { name: "PETG", priceUahPerKg: 650, defaultWastePercent: 7 },
    { name: "ABS", priceUahPerKg: 700, defaultWastePercent: 10 },
    { name: "TPU", priceUahPerKg: 900, defaultWastePercent: 8 }
  ];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { name: material.name },
      update: material,
      create: material
    });
  }

  const services = [
    { name: "Support removal", fixedUah: 20, usesTime: true },
    { name: "Sanding", fixedUah: 30, usesTime: true },
    { name: "Primer", fixedUah: 40, usesTime: false },
    { name: "Painting", fixedUah: 60, usesTime: true },
    { name: "Packaging", fixedUah: 15, usesTime: false }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service
    });
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
