import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: Number(params.id) },
    include: { services: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newProject = await prisma.project.create({
    data: {
      title: `${project.title} (copy)`
    },
    select: { id: true }
  });

  await prisma.project.update({
    where: { id: newProject.id },
    data: {
      date: project.date,
      qty: project.qty,
      note: project.note,
      stlPath: project.stlPath,
      stlXmm: project.stlXmm,
      stlYmm: project.stlYmm,
      stlZmm: project.stlZmm,
      printerId: project.printerId,
      materialId: project.materialId,
      printTimeHours: project.printTimeHours,
      materialGrams: project.materialGrams,
      wastePercent: project.wastePercent,
      saleMode: project.saleMode,
      markupPercent: project.markupPercent,
      manualSalePriceUah: project.manualSalePriceUah,
      includePrinterAmort: project.includePrinterAmort,
      includePrinterService: project.includePrinterService
    }
  });

  if (project.services.length > 0) {
    await prisma.projectService.createMany({
      data: project.services.map((service) => ({
        projectId: newProject.id,
        serviceId: service.serviceId,
        timeMinutes: service.timeMinutes
      }))
    });
  }

  return NextResponse.json({ id: newProject.id });
}
