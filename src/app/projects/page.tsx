"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FilePlus2, FolderPlus, Trash2, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StlViewer } from "@/components/stl-viewer";
import { calcCosts, calcPricing } from "@/lib/calc";
import { AppShell } from "@/components/app-shell";

const projectSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  qty: z.number().min(1),
  note: z.string().optional(),
  stlPath: z.string().optional().nullable(),
  stlXmm: z.number().nullable().optional(),
  stlYmm: z.number().nullable().optional(),
  stlZmm: z.number().nullable().optional(),
  printerId: z.number().nullable().optional(),
  materialId: z.number().nullable().optional(),
  printTimeHours: z.number().min(0),
  materialGrams: z.number().min(0),
  wastePercent: z.number().min(0).max(100),
  saleMode: z.enum(["markup", "manual"]),
  markupPercent: z.number().min(-100).max(1000),
  manualSalePriceUah: z.number().min(0),
  includePrinterAmort: z.boolean(),
  includePrinterService: z.boolean(),
  services: z.array(
    z.object({
      serviceId: z.number(),
      selected: z.boolean(),
      timeMinutes: z.number().nullable().optional()
    })
  )
});

type ProjectForm = z.infer<typeof projectSchema>;

const emptyForm: ProjectForm = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  qty: 1,
  note: "",
  stlPath: null,
  stlXmm: null,
  stlYmm: null,
  stlZmm: null,
  printerId: null,
  materialId: null,
  printTimeHours: 0,
  materialGrams: 0,
  wastePercent: 0,
  saleMode: "markup",
  markupPercent: 30,
  manualSalePriceUah: 0,
  includePrinterAmort: false,
  includePrinterService: false,
  services: []
};

type Metadata = {
  settings: { electricityUahPerKwh: number; laborUahPerHour: number } | null;
  printers: {
    id: number;
    name: string;
    powerWatts: number;
    amortUahPerHour: number | null;
    serviceUahPerHour: number | null;
  }[];
  materials: {
    id: number;
    name: string;
    priceUahPerKg: number;
    defaultWastePercent: number;
  }[];
  services: {
    id: number;
    name: string;
    fixedUah: number;
    usesTime: boolean;
  }[];
};

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<
    { id: number; title: string; date: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [search, setSearch] = useState("");
  const [stlPreviewUrl, setStlPreviewUrl] = useState<string | null>(null);
  const [pendingDimensions, setPendingDimensions] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const stlFallbackTimer = useRef<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const skipAutoSave = useRef(true);

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyForm
  });

  const values = form.watch();

  useEffect(() => {
    const load = async () => {
      const [projectsRes, metaRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/metadata")
      ]);
      const projectsData = await projectsRes.json();
      const metaData = await metaRes.json();
      setProjectList(projectsData);
      setMetadata(metaData);
      if (projectsData.length > 0) {
        setSelectedId(projectsData[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      form.reset(emptyForm);
      return;
    }

    const loadProject = async () => {
      const response = await fetch(`/api/projects/${selectedId}`);
      const data = await response.json();
      const services = metadata?.services.map((service) => {
        const selected = data.services.find(
          (item: { serviceId: number }) => item.serviceId === service.id
        );
        return {
          serviceId: service.id,
          selected: Boolean(selected),
          timeMinutes: selected?.timeMinutes ?? 0
        };
      });

      form.reset({
        ...emptyForm,
        ...data,
        date: new Date(data.date).toISOString().slice(0, 10),
        printerId: data.printerId ?? null,
        materialId: data.materialId ?? null,
        services: services ?? []
      });
      setStlPreviewUrl(data.stlPath ?? null);
      skipAutoSave.current = true;
    };

    loadProject();
  }, [selectedId, metadata, form]);

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }

    if (!selectedId) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(async () => {
      const result = projectSchema.safeParse(values);
      if (!result.success) return;

      setSaveStatus("saving");
      await fetch(`/api/projects/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          date: new Date(result.data.date).toISOString()
        })
      });
      setSaveStatus("saved");
      toast.success("Project saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      refreshList();
    }, 800);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [values, selectedId]);

  const refreshList = async () => {
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjectList(data);
  };

  const handleNew = async () => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New project" })
    });
    const data = await response.json();
    await refreshList();
    setSelectedId(data.id);
    toast.success("Project created");
  };

  const handleDuplicate = async () => {
    if (!selectedId) return;
    const response = await fetch(`/api/projects/${selectedId}/duplicate`, {
      method: "POST"
    });
    const data = await response.json();
    await refreshList();
    setSelectedId(data.id);
    toast.success("Project duplicated");
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;
    await fetch(`/api/projects/${selectedId}`, { method: "DELETE" });
    toast.success("Project deleted");
    await refreshList();
    setSelectedId(null);
  };

  const filteredProjects = projectList.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPrinter = metadata?.printers.find(
    (printer) => printer.id === values.printerId
  );
  const selectedMaterial = metadata?.materials.find(
    (material) => material.id === values.materialId
  );

  const costs = useMemo(() => {
    const laborMinutes = values.services
      .filter((service) => service.selected)
      .reduce((total, service) => total + (service.timeMinutes ?? 0), 0);
    const fixedServices = values.services
      .filter((service) => service.selected)
      .reduce((total, service) => {
        const meta = metadata?.services.find(
          (item) => item.id === service.serviceId
        );
        return total + (meta?.fixedUah ?? 0);
      }, 0);

    return calcCosts({
      printTimeHours: values.printTimeHours,
      printerPowerWatts: selectedPrinter?.powerWatts,
      electricityUahPerKwh: metadata?.settings?.electricityUahPerKwh ?? 0,
      materialGrams: values.materialGrams,
      materialPriceUahPerKg: selectedMaterial?.priceUahPerKg,
      wastePercent: values.wastePercent,
      laborMinutes,
      laborUahPerHour: metadata?.settings?.laborUahPerHour ?? 0,
      fixedServicesUah: fixedServices,
      printerAmortUahPerHour: selectedPrinter?.amortUahPerHour,
      printerServiceUahPerHour: selectedPrinter?.serviceUahPerHour,
      includePrinterAmort: values.includePrinterAmort,
      includePrinterService: values.includePrinterService
    });
  }, [values, metadata, selectedPrinter, selectedMaterial]);

  const pricing = useMemo(() => {
    return calcPricing({
      cogs: costs.cogs,
      saleMode: values.saleMode,
      markupPercent: values.markupPercent,
      manualSalePriceUah: values.manualSalePriceUah
    });
  }, [costs.cogs, values]);

  const warningMissing =
    !values.printerId || !values.materialId
      ? "Select printer and material to get full cost"
      : null;

  const handleMaterialChange = (value: number | null) => {
    const material = metadata?.materials.find((item) => item.id === value);
    if (material) {
      form.setValue("wastePercent", material.defaultWastePercent);
    }
  };

  const handleStlUpload = async (file: File, dims?: { x: number; y: number; z: number } | null) => {
    if (!selectedId) return;
    const formData = new FormData();
    formData.append("file", file);
    if (dims) {
      formData.append("stlXmm", String(dims.x));
      formData.append("stlYmm", String(dims.y));
      formData.append("stlZmm", String(dims.z));
    }

    const response = await fetch(`/api/projects/${selectedId}/stl`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    form.setValue("stlPath", data.path);
    if (dims) {
      form.setValue("stlXmm", dims.x);
      form.setValue("stlYmm", dims.y);
      form.setValue("stlZmm", dims.z);
    }
    toast.success("STL uploaded");
    await refreshList();
  };

  useEffect(() => {
    if (stlFile && pendingDimensions) {
      handleStlUpload(stlFile, pendingDimensions);
      setStlFile(null);
      if (stlFallbackTimer.current) {
        clearTimeout(stlFallbackTimer.current);
        stlFallbackTimer.current = null;
      }
    }
  }, [stlFile, pendingDimensions]);

  useEffect(() => {
    if (!stlFile) return;
    if (stlFallbackTimer.current) {
      clearTimeout(stlFallbackTimer.current);
    }
    stlFallbackTimer.current = setTimeout(() => {
      if (stlFile) {
        handleStlUpload(stlFile, null);
        setStlFile(null);
      }
    }, 1500);
  }, [stlFile]);

  const [printHours, printMinutes] = useMemo(() => {
    const totalMinutes = Math.round((values.printTimeHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return [hours, minutes];
  }, [values.printTimeHours]);

  return (
    <AppShell
      title="Projects"
      description="Auto-save enabled · changes persist every 800ms."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            Project list
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Search project..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button size="icon" variant="secondary" onClick={handleNew}>
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedId === project.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <div className="font-medium">{project.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(project.date).toLocaleDateString("uk-UA")}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-slate-500">Active project</div>
              <div className="text-lg font-semibold text-slate-900">
                {values.title || "Untitled"}
              </div>
              <div className="text-xs text-slate-500">
                Status:{" "}
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Idle"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleNew}>
                <FilePlus2 className="mr-2 h-4 w-4" /> New project
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          {warningMissing && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" /> {warningMissing}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={values.date}
                    onChange={(event) => form.setValue("date", event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="qty">Qty</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    value={values.qty}
                    onChange={(event) =>
                      form.setValue("qty", Number(event.target.value))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea id="note" {...form.register("note")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Printing setup</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Printer</Label>
                  <Select
                    value={values.printerId?.toString() ?? ""}
                    onChange={(event) =>
                      form.setValue(
                        "printerId",
                        event.target.value
                          ? Number(event.target.value)
                          : null
                      )
                    }
                  >
                    <option value="">Select printer</option>
                    {metadata?.printers.map((printer) => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name}
                      </option>
                    ))}
                  </Select>
                  {selectedPrinter && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div>Power: {selectedPrinter.powerWatts} W</div>
                      {selectedPrinter.amortUahPerHour && (
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={values.includePrinterAmort}
                            onChange={(event) =>
                              form.setValue(
                                "includePrinterAmort",
                                event.target.checked
                              )
                            }
                          />
                          Include amortization ({selectedPrinter.amortUahPerHour} грн/год)
                        </label>
                      )}
                      {selectedPrinter.serviceUahPerHour && (
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={values.includePrinterService}
                            onChange={(event) =>
                              form.setValue(
                                "includePrinterService",
                                event.target.checked
                              )
                            }
                          />
                          Include service ({selectedPrinter.serviceUahPerHour} грн/год)
                        </label>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Print time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={printHours}
                      onChange={(event) => {
                        const hours = Number(event.target.value || 0);
                        form.setValue(
                          "printTimeHours",
                          hours + printMinutes / 60
                        );
                      }}
                      placeholder="Hours"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={printMinutes}
                      onChange={(event) => {
                        const minutes = Number(event.target.value || 0);
                        form.setValue(
                          "printTimeHours",
                          printHours + minutes / 60
                        );
                      }}
                      placeholder="Minutes"
                    />
                  </div>
                </div>
                <div>
                  <Label>Material</Label>
                  <Select
                    value={values.materialId?.toString() ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                        ? Number(event.target.value)
                        : null;
                      form.setValue("materialId", value);
                      handleMaterialChange(value);
                    }}
                  >
                    <option value="">Select material</option>
                    {metadata?.materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Material grams</Label>
                  <Input
                    type="number"
                    min={0}
                    value={values.materialGrams}
                    onChange={(event) =>
                      form.setValue("materialGrams", Number(event.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Waste %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={values.wastePercent}
                    onChange={(event) =>
                      form.setValue("wastePercent", Number(event.target.value))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>STL viewer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="file"
                    accept=".stl"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setStlPreviewUrl(url);
                      setPendingDimensions(null);
                      setStlFile(file);
                    }}
                  />
                  {values.stlPath && (
                    <span className="text-sm text-slate-500">
                      Stored: {values.stlPath}
                    </span>
                  )}
                </div>
                {stlPreviewUrl ? (
                  <StlViewer
                    url={stlPreviewUrl}
                    onDimensions={(dims) => {
                      setPendingDimensions(dims);
                    }}
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-400">
                    Upload STL to preview
                  </div>
                )}
                <div className="grid gap-2 text-sm md:grid-cols-3">
                  <div>
                    <Label>X (mm)</Label>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      {values.stlXmm ?? "-"}
                    </div>
                  </div>
                  <div>
                    <Label>Y (mm)</Label>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      {values.stlYmm ?? "-"}
                    </div>
                  </div>
                  <div>
                    <Label>Z (mm)</Label>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      {values.stlZmm ?? "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post-processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metadata?.services.map((service, index) => {
                  const selected = values.services[index];
                  return (
                    <div
                      key={service.id}
                      className="flex flex-wrap items-center gap-3 rounded-md border border-slate-100 px-3 py-2"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selected?.selected ?? false}
                          onChange={(event) =>
                            form.setValue(
                              `services.${index}.selected`,
                              event.target.checked
                            )
                          }
                        />
                        {service.name}
                      </label>
                      {service.usesTime && (
                        <Input
                          className="w-28"
                          type="number"
                          min={0}
                          value={selected?.timeMinutes ?? 0}
                          onChange={(event) =>
                            form.setValue(
                              `services.${index}.timeMinutes`,
                              Number(event.target.value)
                            )
                          }
                        />
                      )}
                      {service.usesTime && (
                        <span className="text-xs text-slate-500">minutes</span>
                      )}
                      <span className="ml-auto text-xs text-slate-500">
                        Fixed: {service.fixedUah} грн
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Sale mode</Label>
                  <Select
                    value={values.saleMode}
                    onChange={(event) =>
                      form.setValue(
                        "saleMode",
                        event.target.value as "markup" | "manual"
                      )
                    }
                  >
                    <option value="markup">Markup</option>
                    <option value="manual">Manual</option>
                  </Select>
                </div>
                {values.saleMode === "markup" ? (
                  <div>
                    <Label>Markup %</Label>
                    <Input
                      type="number"
                      min={-100}
                      max={1000}
                      value={values.markupPercent}
                      onChange={(event) =>
                        form.setValue("markupPercent", Number(event.target.value))
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Manual sale price (грн)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={values.manualSalePriceUah}
                      onChange={(event) =>
                        form.setValue(
                          "manualSalePriceUah",
                          Number(event.target.value)
                        )
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Electricity</span>
                    <span>
                      {costs.electricityKwh} kWh · {Math.round(costs.electricityCost)} грн
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Material</span>
                    <span>{Math.round(costs.materialCost)} грн</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Labor</span>
                    <span>{Math.round(costs.laborCost)} грн</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fixed services</span>
                    <span>{Math.round(costs.fixedServicesCost)} грн</span>
                  </div>
                  {values.includePrinterAmort && (
                    <div className="flex items-center justify-between">
                      <span>Printer amort</span>
                      <span>{Math.round(costs.printerAmortCost)} грн</span>
                    </div>
                  )}
                  {values.includePrinterService && (
                    <div className="flex items-center justify-between">
                      <span>Printer service</span>
                      <span>{Math.round(costs.printerServiceCost)} грн</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-semibold">
                    <span>Post-processing total</span>
                    <span>{Math.round(costs.postCost)} грн</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>COGS</span>
                    <span>{Math.round(costs.cogs)} грн</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between">
                    <span>Sale price</span>
                    <span>{Math.round(pricing.salePrice)} грн</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Profit</span>
                    <span>{Math.round(pricing.profit)} грн</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Margin %</span>
                    <span>{pricing.marginPercent.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Button variant="secondary" className="w-full" onClick={handleDuplicate}>
                    Duplicate project
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleNew}>
                    Create new
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
