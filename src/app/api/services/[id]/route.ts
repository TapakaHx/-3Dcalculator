import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const service = await prisma.service.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      fixedUah: data.fixedUah,
      usesTime: data.usesTime
    }
  });
  return NextResponse.json(service);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.service.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
