import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      date: true,
      updatedAt: true
    }
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const data = await request.json().catch(() => ({}));
  const project = await prisma.project.create({
    data: {
      title: data.title || "New project",
      date: data.date ? new Date(data.date) : new Date(),
      qty: data.qty ?? 1,
      note: data.note ?? null
    }
  });
  return NextResponse.json(project);
}
