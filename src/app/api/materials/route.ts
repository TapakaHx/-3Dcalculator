import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const materials = await prisma.material.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const data = await request.json();
  const material = await prisma.material.create({
    data: {
      name: data.name,
      priceUahPerKg: data.priceUahPerKg,
      defaultWastePercent: data.defaultWastePercent
    }
  });
  return NextResponse.json(material);
}
