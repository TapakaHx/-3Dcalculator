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
    const [settingsRes, printersRes, materialsRes, servicesRes] = await Promise.all([
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
    toast.success("Налаштування збережено");
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
    toast.success("Принтер додано");
    load();
  };

  const addMaterial = async () => {
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMaterial)
    });
    setNewMaterial({ name: "", priceUahPerKg: 0, defaultWastePercent: 0 });
    toast.success("Матеріал додано");
    load();
  };

  const addService = async () => {
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService)
    });
    setNewService({ name: "", fixedUah: 0, usesTime: false });
    toast.success("Послугу додано");
    load();
  };

  return (
    <AppShell
      title="Налаштування"
      description="Зручні тарифи та параметри принтерів, матеріалів і послуг."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Загальні налаштування</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Електроенергія (грн за кВт·год)</Label>
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
              <Label>Робота (грн за годину)</Label>
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
              <Save className="mr-2 h-4 w-4" /> Зберегти
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Принтери</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {printers.map((printer) => (
              <div key={printer.id} className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <div>
                  <Label>Назва</Label>
                  <Input
                    value={printer.name}
                    onChange={(event) =>
                      setPrinters((prev) =>
                        prev.map((item) =>
                          item.id === printer.id ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Наприклад: Bambu Lab P1S"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <Label>Споживання, Вт</Label>
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
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <Label>Амортизація, грн/год</Label>
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
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Сервіс, грн/год</Label>
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
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Амортизація та сервіс враховуються в розрахунку лише якщо увімкнути їх у проекті.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await fetch(`/api/printers/${printer.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(printer)
                      });
                      toast.success("Принтер оновлено");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Зберегти
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/printers/${printer.id}`, { method: "DELETE" });
                      toast.success("Принтер видалено");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Видалити
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3 dark:border-slate-700">
              <Input
                value={newPrinter.name}
                onChange={(event) => setNewPrinter({ ...newPrinter, name: event.target.value })}
                placeholder="Назва нового принтера"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Input
                  type="number"
                  value={newPrinter.powerWatts}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, powerWatts: Number(event.target.value) })
                  }
                  placeholder="Споживання, Вт"
                />
                <Input
                  type="number"
                  value={newPrinter.amortUahPerHour}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, amortUahPerHour: Number(event.target.value) })
                  }
                  placeholder="Амортизація, грн/год"
                />
                <Input
                  type="number"
                  value={newPrinter.serviceUahPerHour}
                  onChange={(event) =>
                    setNewPrinter({ ...newPrinter, serviceUahPerHour: Number(event.target.value) })
                  }
                  placeholder="Сервіс, грн/год"
                />
              </div>
              <Button variant="secondary" onClick={addPrinter}>
                <Plus className="mr-2 h-4 w-4" /> Додати принтер
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Матеріали</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <Input
                  value={material.name}
                  onChange={(event) =>
                    setMaterials((prev) =>
                      prev.map((item) =>
                        item.id === material.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Назва"
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
                    placeholder="Ціна (грн/кг)"
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
                    placeholder="Відходи %"
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
                      toast.success("Матеріал оновлено");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Зберегти
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
                      toast.success("Матеріал видалено");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Видалити
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3 dark:border-slate-700">
              <Input
                value={newMaterial.name}
                onChange={(event) => setNewMaterial({ ...newMaterial, name: event.target.value })}
                placeholder="Назва нового матеріалу"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newMaterial.priceUahPerKg}
                  onChange={(event) =>
                    setNewMaterial({ ...newMaterial, priceUahPerKg: Number(event.target.value) })
                  }
                  placeholder="Ціна (грн/кг)"
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
                  placeholder="Відходи %"
                />
              </div>
              <Button variant="secondary" onClick={addMaterial}>
                <Plus className="mr-2 h-4 w-4" /> Додати матеріал
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Послуги</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <Input
                  value={service.name}
                  onChange={(event) =>
                    setServices((prev) =>
                      prev.map((item) =>
                        item.id === service.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Назва"
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
                    placeholder="Фіксована ціна, грн"
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
                    Потребує часу
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
                      toast.success("Послугу оновлено");
                      load();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Зберегти
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/services/${service.id}`, { method: "DELETE" });
                      toast.success("Послугу видалено");
                      load();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Видалити
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3 dark:border-slate-700">
              <Input
                value={newService.name}
                onChange={(event) => setNewService({ ...newService, name: event.target.value })}
                placeholder="Назва нової послуги"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={newService.fixedUah}
                  onChange={(event) =>
                    setNewService({ ...newService, fixedUah: Number(event.target.value) })
                  }
                  placeholder="Фіксована ціна, грн"
                />
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={newService.usesTime}
                    onChange={(event) =>
                      setNewService({ ...newService, usesTime: event.target.checked })
                    }
                  />
                  Потребує часу
                </label>
              </div>
              <Button variant="secondary" onClick={addService}>
                <Plus className="mr-2 h-4 w-4" /> Додати послугу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
