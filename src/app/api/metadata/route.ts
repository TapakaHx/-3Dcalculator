import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [settings, printers, materials, services] = await Promise.all([
    prisma.globalSettings.findFirst(),
    prisma.printer.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } })
  ]);

  return NextResponse.json({
    settings,
    printers,
    materials,
    services
  });
}
