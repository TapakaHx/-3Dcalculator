import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: Number(params.id) },
    include: {
      services: {
        include: { service: true }
      },
      printer: true,
      material: true
    }
  });
  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const { services, ...projectData } = data;

  const project = await prisma.project.update({
    where: { id: Number(params.id) },
    data: {
      title: projectData.title,
      date: new Date(projectData.date),
      qty: projectData.qty,
      note: projectData.note ?? null,
      stlPath: projectData.stlPath ?? null,
      stlXmm: projectData.stlXmm ?? null,
      stlYmm: projectData.stlYmm ?? null,
      stlZmm: projectData.stlZmm ?? null,
      printerId: projectData.printerId ?? null,
      materialId: projectData.materialId ?? null,
      printTimeHours: projectData.printTimeHours ?? 0,
      materialGrams: projectData.materialGrams ?? 0,
      wastePercent: projectData.wastePercent ?? 0,
      saleMode: projectData.saleMode ?? "markup",
      markupPercent: projectData.markupPercent ?? 30,
      manualSalePriceUah: projectData.manualSalePriceUah ?? 0,
      includePrinterAmort: projectData.includePrinterAmort ?? false,
      includePrinterService: projectData.includePrinterService ?? false
    }
  });

  if (Array.isArray(services)) {
    const selected = services.filter((item) => item.selected);
    const selectedIds = selected.map((item) => item.serviceId);

    await prisma.projectService.deleteMany({
      where: {
        projectId: project.id,
        serviceId: { notIn: selectedIds }
      }
    });

    for (const service of selected) {
      await prisma.projectService.upsert({
        where: {
          projectId_serviceId: {
            projectId: project.id,
            serviceId: service.serviceId
          }
        },
        update: {
          timeMinutes: service.timeMinutes ?? null
        },
        create: {
          projectId: project.id,
          serviceId: service.serviceId,
          timeMinutes: service.timeMinutes ?? null
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.project.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
