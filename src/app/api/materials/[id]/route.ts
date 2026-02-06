import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const material = await prisma.material.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      priceUahPerKg: data.priceUahPerKg,
      defaultWastePercent: data.defaultWastePercent
    }
  });
  return NextResponse.json(material);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.material.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
