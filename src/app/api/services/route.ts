import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const data = await request.json();
  const service = await prisma.service.create({
    data: {
      name: data.name,
      fixedUah: data.fixedUah,
      usesTime: data.usesTime
    }
  });
  return NextResponse.json(service);
}
