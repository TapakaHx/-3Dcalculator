import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (start) dateFilter.gte = new Date(start);
  if (end) dateFilter.lte = new Date(end);

  const where = Object.keys(dateFilter).length
    ? { date: dateFilter }
    : undefined;

  const projects = await prisma.project.findMany({
    where,
    include: {
      printer: true,
      material: true,
      services: { include: { service: true } }
    }
  });

  return NextResponse.json({ projects });
}
