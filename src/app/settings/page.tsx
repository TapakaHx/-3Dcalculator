"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    electricityUahPerKwh: 4.32,
    laborUahPerHour: 200
  });
  const [printers, setPrinters] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newPrinter, setNewPrinter] = useState({
    name: "",
    powerWatts: 0,
    amortUahPerHour: 0,
    serviceUahPerHour: 0
  });
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    priceUahPerKg: 0,
    defaultWastePercent: 0
  });
  const [newService, setNewService] = useState({
    name: "",
    fixedUah: 0,
    usesTime: false
  });

  const load = async () => {
    const [settingsRes, printersRes, materialsRes, servicesRes] =
      await Promise.all([
        fetch("/api/settings"),
        fetch("/api/printers"),
        fetch("/api/materials"),
        fetch("/api/services")
      ]);
    const settingsData = await settingsRes.json();
    setSettings(settingsData ?? settings);
    setPrinters(await printersRes.json());
    setMaterials(await materialsRes.json());
    setServices(await servicesRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const saveSettings = async () => {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    toast.success("Settings saved");
  };

  const addPrinter = async () => {
    await fetch("/api/printers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPrinter,
        amortUahPerHour: newPrinter.amortUahPerHour || null,
        serviceUahPerHour: newPrinter.serviceUahPerHour || null
      })
    });
    setNewPrinter({ name: "", powerWatts: 0, amortUahPerHour: 0, serviceUahPerHour: 0 });
    toast.success("Printer added");
    load();
  };

  const addMaterial = async () => {
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMaterial)
    });
    setNewMaterial({ name: "", priceUahPerKg: 0, defaultWastePercent: 0 });
    toast.success("Material added");
    load();
  };

  const addService = async () => {
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService)
    });
    setNewService({ name: "", fixedUah: 0, usesTime: false });
    toast.success("Service added");
    load();
  };

  return (
    <AppShell
      title="Settings"
      description="Manage defaults, printers, materials, and services."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Global settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Electricity (UAH per kWh)</Label>
              <Input
                type="number"
                value={settings.electricityUahPerKwh}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    electricityUahPerKwh: Number(event.target.value)
                  })
                }
              />
            </div>
            <div>
              <Label>Labor (UAH per hour)</Label>
              <Input
                type="number"
                value={settings.laborUahPerHour}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    laborUahPerHour: Number(event.target.value)
                  })
                }
              />
            </div>
            <Button onClick={saveSettings}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Printers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {printers.map((printer) => (
              <div key={printer.id} className="space-y-2 rounded-md border border-slate-200 p-3">
                <Input
                  value={printer.name}
                  onChange={(event) =>
                    setPrinters((prev) =>
                      prev.map((item) =>
                        item.id === printer.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={printer.powerWatts}
                    onChange={(event) =>
                      setPrinters((prev) =>
                        prev.map((item) =>
                          item.id === printer.id
                            ? { ...item, powerWatts: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Power (W)"
                  />
                  <Input
                    type="number"
                    value={printer.amortUahPerHour ?? 0}
                    onChange={(event) =>
                      setPrinters((prev) =>
                        prev.map((item) =>
                          item.id === printer.id
                            ? { ...item, amortUahPerHour: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Amortization"
                  />
                  <Input
                    type="number"
                    value={printer.serviceUahPerHour ?? 0}
                    onChange={(event) =>
                      setPrinters((prev) =>
                        prev.map((item) =>
                          item.id === printer.id
                            ? { ...item, serviceUahPerHour: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Service"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await fetch(`/api/printers/${printer.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(printer)
                      });
                      toast.success("Printer updated");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/printers/${printer.id}`, { method: "DELETE" });
                      toast.success("Printer deleted");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3">
              <Input
                value={newPrinter.name}
                onChange={(event) => setNewPrinter({ ...newPrinter, name: event.target.value })}
                placeholder="New printer name"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newPrinter.powerWatts}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, powerWatts: Number(event.target.value) })
                  }
                  placeholder="Power (W)"
                />
                <Input
                  type="number"
                  value={newPrinter.amortUahPerHour}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, amortUahPerHour: Number(event.target.value) })
                  }
                  placeholder="Amortization"
                />
                <Input
                  type="number"
                  value={newPrinter.serviceUahPerHour}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, serviceUahPerHour: Number(event.target.value) })
                  }
                  placeholder="Service"
                />
              </div>
              <Button variant="secondary" onClick={addPrinter}>
                <Plus className="mr-2 h-4 w-4" /> Add printer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="space-y-2 rounded-md border border-slate-200 p-3">
                <Input
                  value={material.name}
                  onChange={(event) =>
                    setMaterials((prev) =>
                      prev.map((item) =>
                        item.id === material.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={material.priceUahPerKg}
                    onChange={(event) =>
                      setMaterials((prev) =>
                        prev.map((item) =>
                          item.id === material.id
                            ? { ...item, priceUahPerKg: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Price (UAH/kg)"
                  />
                  <Input
                    type="number"
                    value={material.defaultWastePercent}
                    onChange={(event) =>
                      setMaterials((prev) =>
                        prev.map((item) =>
                          item.id === material.id
                            ? { ...item, defaultWastePercent: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Waste %"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await fetch(`/api/materials/${material.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(material)
                      });
                      toast.success("Material updated");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
                      toast.success("Material deleted");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3">
              <Input
                value={newMaterial.name}
                onChange={(event) => setNewMaterial({ ...newMaterial, name: event.target.value })}
                placeholder="New material name"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newMaterial.priceUahPerKg}
                  onChange={(event) =>
                    setNewMaterial({ ...newMaterial, priceUahPerKg: Number(event.target.value) })
                  }
                  placeholder="Price (UAH/kg)"
                />
                <Input
                  type="number"
                  value={newMaterial.defaultWastePercent}
                  onChange={(event) =>
                    setNewMaterial({
                      ...newMaterial,
                      defaultWastePercent: Number(event.target.value)
                    })
                  }
                  placeholder="Waste %"
                />
              </div>
              <Button variant="secondary" onClick={addMaterial}>
                <Plus className="mr-2 h-4 w-4" /> Add material
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="space-y-2 rounded-md border border-slate-200 p-3">
                <Input
                  value={service.name}
                  onChange={(event) =>
                    setServices((prev) =>
                      prev.map((item) =>
                        item.id === service.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={service.fixedUah}
                    onChange={(event) =>
                      setServices((prev) =>
                        prev.map((item) =>
                          item.id === service.id
                            ? { ...item, fixedUah: Number(event.target.value) }
                            : item
                        )
                      )
                    }
                    placeholder="Fixed UAH"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={service.usesTime}
                      onChange={(event) =>
                        setServices((prev) =>
                          prev.map((item) =>
                            item.id === service.id
                              ? { ...item, usesTime: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    Uses time
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await fetch(`/api/services/${service.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(service)
                      });
                      toast.success("Service updated");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/services/${service.id}`, { method: "DELETE" });
                      toast.success("Service deleted");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3">
              <Input
                value={newService.name}
                onChange={(event) => setNewService({ ...newService, name: event.target.value })}
                placeholder="New service name"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newService.fixedUah}
                  onChange={(event) =>
                    setNewService({ ...newService, fixedUah: Number(event.target.value) })
                  }
                  placeholder="Fixed UAH"
                />
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={newService.usesTime}
                    onChange={(event) =>
                      setNewService({ ...newService, usesTime: event.target.checked })
                    }
                  />
                  Uses time
                </label>
              </div>
              <Button variant="secondary" onClick={addService}>
                <Plus className="mr-2 h-4 w-4" /> Add service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
