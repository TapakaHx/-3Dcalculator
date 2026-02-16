import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const printers = await prisma.printer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(printers);
}

export async function POST(request: Request) {
  const data = await request.json();
  const printer = await prisma.printer.create({
    data: {
      name: data.name,
      powerWatts: data.powerWatts,
      amortUahPerHour: data.amortUahPerHour ?? null,
      serviceUahPerHour: data.serviceUahPerHour ?? null
    }
  });
  return NextResponse.json(printer);
}
