import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.globalSettings.findFirst();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const data = await request.json();
  const existing = await prisma.globalSettings.findFirst();

  const settings = existing
    ? await prisma.globalSettings.update({
        where: { id: existing.id },
        data: {
          electricityUahPerKwh: data.electricityUahPerKwh,
          laborUahPerHour: data.laborUahPerHour
        }
      })
    : await prisma.globalSettings.create({
        data: {
          electricityUahPerKwh: data.electricityUahPerKwh,
          laborUahPerHour: data.laborUahPerHour
        }
      });

  return NextResponse.json(settings);
}
