import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const stlXmm = Number(formData.get("stlXmm"));
  const stlYmm = Number(formData.get("stlYmm"));
  const stlZmm = Number(formData.get("stlZmm"));

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${Date.now()}-${file.name}`.replace(/\s+/g, "-");
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  const publicPath = `/uploads/${filename}`;

  await prisma.project.update({
    where: { id: Number(params.id) },
    data: {
      stlPath: publicPath,
      stlXmm: Number.isFinite(stlXmm) ? stlXmm : null,
      stlYmm: Number.isFinite(stlYmm) ? stlYmm : null,
      stlZmm: Number.isFinite(stlZmm) ? stlZmm : null
    }
  });

  return NextResponse.json({ path: publicPath });
}
