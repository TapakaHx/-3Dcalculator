import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const printer = await prisma.printer.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      powerWatts: data.powerWatts,
      amortUahPerHour: data.amortUahPerHour ?? null,
      serviceUahPerHour: data.serviceUahPerHour ?? null
    }
  });
  return NextResponse.json(printer);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.printer.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
