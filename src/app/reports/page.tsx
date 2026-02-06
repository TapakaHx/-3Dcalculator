"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcCosts, calcPricing } from "@/lib/calc";
import { AppShell } from "@/components/app-shell";

export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const load = async () => {
    const query = new URLSearchParams();
    if (start) query.set("start", start);
    if (end) query.set("end", end);

    const [reportsRes, metaRes] = await Promise.all([
      fetch(`/api/reports?${query.toString()}`),
      fetch("/api/metadata")
    ]);
    const reportsData = await reportsRes.json();
    const metaData = await metaRes.json();
    setProjects(reportsData.projects || []);
    setSettings(metaData.settings);
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const totals = { cogs: 0, revenue: 0, profit: 0 };
    projects.forEach((project) => {
      const laborMinutes = project.services.reduce(
        (total: number, service: any) => total + (service.timeMinutes ?? 0),
        0
      );
      const fixedServices = project.services.reduce(
        (total: number, service: any) => total + (service.service?.fixedUah ?? 0),
        0
      );

      const costs = calcCosts({
        printTimeHours: project.printTimeHours,
        printerPowerWatts: project.printer?.powerWatts,
        electricityUahPerKwh: settings?.electricityUahPerKwh ?? 0,
        materialGrams: project.materialGrams,
        materialPriceUahPerKg: project.material?.priceUahPerKg,
        wastePercent: project.wastePercent,
        laborMinutes,
        laborUahPerHour: settings?.laborUahPerHour ?? 0,
        fixedServicesUah: fixedServices,
        printerAmortUahPerHour: project.printer?.amortUahPerHour,
        printerServiceUahPerHour: project.printer?.serviceUahPerHour,
        includePrinterAmort: project.includePrinterAmort,
        includePrinterService: project.includePrinterService
      });
      const pricing = calcPricing({
        cogs: costs.cogs,
        saleMode: project.saleMode,
        markupPercent: project.markupPercent,
        manualSalePriceUah: project.manualSalePriceUah
      });

      totals.cogs += costs.cogs;
      totals.revenue += pricing.salePrice;
      totals.profit += pricing.profit;
    });

    return {
      count: projects.length,
      cogs: totals.cogs,
      revenue: totals.revenue,
      profit: totals.profit
    };
  }, [projects, settings]);

  return (
    <AppShell
      title="Reports"
      description="Monthly summary by date range."
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-slate-600">Start date</label>
            <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-600">End date</label>
            <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <Button onClick={load}>Apply</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total projects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.count}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total COGS</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {Math.round(summary.cogs)} грн
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {Math.round(summary.revenue)} грн
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total profit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {Math.round(summary.profit)} грн
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
